import {
  getRecurringTransactions,
  updateRecurringTransaction,
} from './business-central/recurring-transaction.service';
import {
  getRecurringExecutions,
  createRecurringExecution,
} from './business-central/recurring-execution.service';
import { transactionGeneratorService } from './transaction-generator.service';
import {
  RecurringTransaction,
  RecurringFrequency,
} from '@/types/recurring-transaction.types';
import {
  parseISO,
  addDays,
  addWeeks,
  addMonths,
  addYears,
  isBefore,
  isEqual,
  format,
} from 'date-fns';

export class RecurringEngineService {
  /**
   * Calculates the next run date based on the current date, frequency, and interval.
   */
  public calculateNextRunDate(
    currentDateStr: string,
    frequency: RecurringFrequency,
    interval: number
  ): string {
    const currentDate = parseISO(currentDateStr);
    let nextDate = currentDate;

    switch (frequency) {
      case 'Daily':
        nextDate = addDays(currentDate, interval);
        break;
      case 'Weekly':
        nextDate = addWeeks(currentDate, interval);
        break;
      case 'BiWeekly':
        nextDate = addWeeks(currentDate, interval * 2);
        break;
      case 'Monthly':
        nextDate = addMonths(currentDate, interval);
        break;
      case 'Quarterly':
        nextDate = addMonths(currentDate, interval * 3);
        break;
      case 'HalfYearly':
        nextDate = addMonths(currentDate, interval * 6);
        break;
      case 'Yearly':
        nextDate = addYears(currentDate, interval);
        break;
      default:
        throw new Error(`Unsupported frequency: ${frequency}`);
    }

    return format(nextDate, 'yyyy-MM-dd');
  }

  /**
   * Main entry point to process all due recurring transactions for a user.
   */
  public async processDueTransactions(ownerEntraObjectId: string): Promise<void> {
    if (!ownerEntraObjectId) return;

    // 1. Fetch active recurring transactions
    const { value: allTransactions } = await getRecurringTransactions(ownerEntraObjectId, { activeOnly: true, top: 1000 });

    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const today = parseISO(todayStr);

    for (const definition of allTransactions) {
      if (!definition.autoGenerate || !definition.active) continue;

      let currentNextRunDate = definition.nextRunDate;

      // 2. Process all dates chronologically until we are caught up
      while (
        currentNextRunDate &&
        (isBefore(parseISO(currentNextRunDate), today) || isEqual(parseISO(currentNextRunDate), today))
      ) {
        // If there's an end date, make sure we haven't passed it
        if (definition.endDate && isBefore(parseISO(definition.endDate), parseISO(currentNextRunDate))) {
          break; // Stop generating
        }

        // 3. Execution History Check
        const { value: history } = await getRecurringExecutions(ownerEntraObjectId, {
          recurringTransactionSystemId: definition.systemId,
        });
        
        const alreadyProcessed = history.some(
          (h) => h.scheduledDate === currentNextRunDate && h.status === 'Success'
        );

        if (!alreadyProcessed) {
          try {
            // 4. Generate the transaction
            const transaction = await transactionGeneratorService.generateTransaction(
              definition,
              currentNextRunDate
            );

            // 5. Record success in execution history
            await createRecurringExecution({
              ownerEntraObjectId,
              recurringTransactionSystemId: definition.systemId,
              generatedTransactionSystemId: transaction.systemId,
              scheduledDate: currentNextRunDate,
              generatedDateTime: new Date().toISOString(),
              status: 'Success',
            });
          } catch (error: any) {
            // Record failure in execution history
            await createRecurringExecution({
              ownerEntraObjectId,
              recurringTransactionSystemId: definition.systemId,
              scheduledDate: currentNextRunDate,
              generatedDateTime: new Date().toISOString(),
              status: 'Failed',
              errorMessage: error.message || 'Unknown error during generation',
            });

            // Stop processing this definition if it fails, to avoid cascading failures
            break; 
          }
        }

        // Advance to the next date
        currentNextRunDate = this.calculateNextRunDate(
          currentNextRunDate,
          definition.frequency,
          definition.interval
        );
      }

      // Update definition if the Next Run Date has advanced
      if (currentNextRunDate !== definition.nextRunDate) {
        await updateRecurringTransaction(
          definition.systemId,
          ownerEntraObjectId,
          { nextRunDate: currentNextRunDate },
          definition.etag
        );
      }
    }
  }
}

export const recurringEngineService = new RecurringEngineService();
