export type RecurringFrequency = 'Daily' | 'Weekly' | 'BiWeekly' | 'Monthly' | 'Quarterly' | 'HalfYearly' | 'Yearly';

export type RecurringExecutionStatus = 'Success' | 'Failed' | 'Skipped';

export interface BCRecurringTransactionCreateDTO {
  ownerEntraObjectId: string;
  name: string;
  transactionType: 'Income' | 'Expense';
  accountId: string;
  accountCode: string;
  categoryId: string;
  categoryCode: string;
  amount: number;
  startDate: string;
  endDate?: string;
  frequency: RecurringFrequency;
  interval: number;
  nextRunDate: string;
  autoGenerate: boolean;
  active: boolean;
  notes?: string;
}

export interface BCRecurringTransactionUpdateDTO {
  name?: string;
  transactionType?: 'Income' | 'Expense';
  accountId?: string;
  accountCode?: string;
  categoryId?: string;
  categoryCode?: string;
  amount?: number;
  startDate?: string;
  endDate?: string;
  frequency?: RecurringFrequency;
  interval?: number;
  nextRunDate?: string;
  autoGenerate?: boolean;
  active?: boolean;
  notes?: string;
}

export interface BCRecurringTransactionResponseDTO {
  '@odata.etag': string;
  systemId: string;
  entryNo: number;
  ownerEntraObjectId: string;
  name: string;
  transactionType: 'Income' | 'Expense';
  accountId: string;
  accountCode: string;
  categoryId: string;
  categoryCode: string;
  amount: number;
  startDate: string;
  endDate?: string;
  frequency: RecurringFrequency;
  interval: number;
  nextRunDate: string;
  autoGenerate: boolean;
  active: boolean;
  notes: string;
  systemCreatedAt: string;
  systemModifiedAt: string;
}

export interface PaginatedRecurringTransactions {
  value: RecurringTransaction[];
  '@odata.nextLink'?: string;
  '@odata.count'?: number;
}

export interface RecurringTransaction {
  etag: string;
  systemId: string;
  entryNo: number;
  ownerEntraObjectId: string;
  name: string;
  transactionType: 'Income' | 'Expense';
  accountId: string;
  accountCode: string;
  categoryId: string;
  categoryCode: string;
  amount: number;
  startDate: string;
  endDate?: string;
  frequency: RecurringFrequency;
  interval: number;
  nextRunDate: string;
  autoGenerate: boolean;
  active: boolean;
  notes: string;
  systemCreatedAt: string;
  systemModifiedAt: string;
}

export interface BCRecurringExecutionCreateDTO {
  ownerEntraObjectId: string;
  recurringTransactionSystemId: string;
  generatedTransactionSystemId?: string;
  scheduledDate: string;
  generatedDateTime: string;
  status: RecurringExecutionStatus;
  errorMessage?: string;
}

export interface BCRecurringExecutionResponseDTO {
  '@odata.etag': string;
  systemId: string;
  entryNo: number;
  ownerEntraObjectId: string;
  recurringTransactionSystemId: string;
  generatedTransactionSystemId: string;
  scheduledDate: string;
  generatedDateTime: string;
  status: RecurringExecutionStatus;
  errorMessage: string;
  systemCreatedAt: string;
  systemModifiedAt: string;
}

export interface RecurringExecution {
  etag: string;
  systemId: string;
  entryNo: number;
  ownerEntraObjectId: string;
  recurringTransactionSystemId: string;
  generatedTransactionSystemId: string;
  scheduledDate: string;
  generatedDateTime: string;
  status: RecurringExecutionStatus;
  errorMessage: string;
  systemCreatedAt: string;
  systemModifiedAt: string;
}

export interface PaginatedRecurringExecutions {
  value: RecurringExecution[];
  '@odata.nextLink'?: string;
  '@odata.count'?: number;
}
