export interface BudgetInput {
  categoryId: string;
  budgetMonth: number;
  budgetYear: number;
  budgetAmount: number;
  notes?: string | null;
}

export interface BCBudgetCreateDTO {
  ownerEntraObjectId: string;
  categoryId: string;
  budgetMonth: number;
  budgetYear: number;
  budgetAmount: number;
  notes?: string;
}

export interface BCBudgetUpdateDTO {
  budgetAmount?: number;
  notes?: string;
}

export interface BCBudgetResponseDTO {
  '@odata.etag': string;
  systemId: string;
  entryNo: number;
  ownerEntraObjectId: string;
  categoryId: string;
  budgetMonth: number;
  budgetYear: number;
  budgetAmount: number;
  notes: string;
  systemCreatedAt: string;
  systemModifiedAt: string;
}

export interface Budget {
  etag: string;
  systemId: string;
  entryNo: number;
  ownerEntraObjectId: string;
  categoryId: string;
  budgetMonth: number;
  budgetYear: number;
  budgetAmount: number;
  notes: string;
  systemCreatedAt: string;
  systemModifiedAt: string;
}

// Extends Budget with calculated analytics
export interface BudgetWithUtilization extends Budget {
  categoryName: string;
  spentAmount: number;
  remainingAmount: number;
  utilizationPercentage: number;
}

export interface PaginatedBudgets {
  value: Budget[];
  '@odata.nextLink'?: string;
  '@odata.count'?: number;
}
