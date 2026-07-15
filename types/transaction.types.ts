export interface TransactionInput {
  transactionDate: string;
  transactionType: 'Income' | 'Expense';
  description: string;
  categoryId: string;
  subcategoryCode?: string | null;
  accountId: string;
  amount: number;
  currencyCode?: string | null;
  paymentMethodCode?: string | null;
  reference?: string | null;
  notes?: string | null;
  tags?: string | null;
}

export interface BCTransactionCreateDTO {
  ownerEntraObjectId: string;
  transactionDate: string;
  transactionType: 'Income' | 'Expense';
  description: string;
  categoryId: string;
  categoryCode: string;
  subcategoryCode?: string;
  accountId: string;
  accountCode: string;
  amount: number;
  currencyCode?: string;
  paymentMethodCode?: string;
  reference?: string;
  notes?: string;
  tags?: string;
}

export interface BCTransactionUpdateDTO {
  transactionDate?: string;
  transactionType?: 'Income' | 'Expense';
  description?: string;
  categoryId?: string;
  categoryCode?: string;
  subcategoryCode?: string;
  accountId?: string;
  accountCode?: string;
  amount?: number;
  currencyCode?: string;
  paymentMethodCode?: string;
  reference?: string;
  notes?: string;
  tags?: string;
}

export interface BCTransactionResponseDTO {
  '@odata.etag': string;
  systemId: string;
  entryNo: number;
  ownerEntraObjectId: string;
  transactionDate: string;
  transactionType: 'Income' | 'Expense';
  description: string;
  categoryId: string;
  categoryCode: string;
  subcategoryCode: string;
  accountId: string;
  accountCode: string;
  amount: number;
  currencyCode: string;
  paymentMethodCode: string;
  reference: string;
  notes: string;
  tags: string;
  systemCreatedAt: string;
  systemModifiedAt: string;
}

export interface Transaction {
  etag: string;
  systemId: string;
  entryNo: number;
  ownerEntraObjectId: string;
  transactionDate: string;
  transactionType: 'Income' | 'Expense';
  description: string;
  categoryId: string;
  categoryCode: string;
  categoryName?: string; // Mapped dynamically in service layer
  subcategoryCode: string;
  accountId: string;
  accountCode: string;
  accountName?: string; // Mapped dynamically in service layer
  amount: number;
  currencyCode: string;
  paymentMethodCode: string;
  reference: string;
  notes: string;
  tags: string;
  systemCreatedAt: string;
  systemModifiedAt: string;
}

export interface BCError {
  error: {
    code: string;
    message: string;
  };
}
