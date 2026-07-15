export type TransactionType = 'Income' | 'Expense';

export interface Category {
  systemId: string;
  code: string;
  name: string;
  transactionType: TransactionType;
  isActive: boolean;
  displayOrder: number;
  colorCode: string;
  iconName: string;
  ownerEntraObjectId: string;
  systemCreatedAt?: string;
  systemModifiedAt?: string;
  etag: string;
}

export interface CategoryListResponse {
  '@odata.context': string;
  value: CategoryResponse[];
}

export interface CategoryResponse {
  systemId: string;
  entryNo: number;
  ownerEntraObjectId: string;
  code: string;
  name: string;
  transactionType: TransactionType;
  isActive: boolean;
  displayOrder: number;
  colorCode: string;
  iconName: string;
  systemCreatedAt: string;
  systemModifiedAt: string;
  '@odata.etag': string;
}
