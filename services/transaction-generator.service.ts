import { RecurringTransaction } from '@/types/recurring-transaction.types';
import { transactionService } from './business-central/transaction.service';
import { Transaction } from '@/types/transaction.types';

export class TransactionGeneratorService {
  /**
   * Generates a new transaction based on a recurring transaction definition and a specific date.
   * @param definition The recurring transaction schedule definition
   * @param date The date this occurrence is for (YYYY-MM-DD)
   * @returns The generated Transaction
   */
  async generateTransaction(
    definition: RecurringTransaction,
    date: string
  ): Promise<Transaction> {
    const description = `${definition.name} (Auto-generated for ${date})`;

    // Use the core transaction service to create a standard transaction
    const newTransaction = await transactionService.createTransaction(definition.ownerEntraObjectId, {
      transactionDate: date,
      transactionType: definition.transactionType,
      description: description,
      categoryId: definition.categoryId,
      categoryCode: definition.categoryCode,
      accountId: definition.accountId,
      accountCode: definition.accountCode,
      amount: definition.amount,
      notes: `Generated from recurring transaction: ${definition.name}`,
    });

    return newTransaction;
  }
}

export const transactionGeneratorService = new TransactionGeneratorService();
