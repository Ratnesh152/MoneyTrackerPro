export type MTLoanType = 'Home' | 'Personal' | 'Vehicle' | 'Education' | 'Business' | 'Gold' | 'Mortgage' | 'Other';
export type MTLoanStatus = 'Active' | 'Closed';

export interface BCLoanResponseDTO {
  systemId: string;
  entryNo: number;
  ownerEntraObjectId: string;
  loanName: string;
  lenderName: string;
  loanType: MTLoanType;
  principalAmount: number;
  interestRate: number;
  tenureMonths: number;
  emiAmount: number;
  startDate: string;
  loanAccountNumber: string;
  currencyCode: string;
  supportsPrepayment: boolean;
  status: MTLoanStatus;
  notes: string;
  systemCreatedAt: string;
  systemModifiedAt: string;
  '@odata.etag': string;
}

export interface BCLoanCreateDTO {
  ownerEntraObjectId: string;
  loanName: string;
  lenderName: string;
  loanType: MTLoanType;
  principalAmount: number;
  interestRate: number;
  tenureMonths: number;
  emiAmount: number;
  startDate: string;
  loanAccountNumber: string;
  currencyCode: string;
  supportsPrepayment?: boolean;
  status?: MTLoanStatus;
  notes?: string;
}

export interface BCLoanUpdateDTO {
  loanName?: string;
  lenderName?: string;
  loanType?: MTLoanType;
  principalAmount?: number;
  interestRate?: number;
  tenureMonths?: number;
  emiAmount?: number;
  startDate?: string;
  loanAccountNumber?: string;
  currencyCode?: string;
  supportsPrepayment?: boolean;
  status?: MTLoanStatus;
  notes?: string;
}

export interface Loan {
  systemId: string;
  ownerEntraObjectId: string;
  loanName: string;
  lenderName: string;
  loanType: MTLoanType;
  principalAmount: number;
  interestRate: number;
  tenureMonths: number;
  emiAmount: number;
  startDate: string;
  loanAccountNumber: string;
  currencyCode: string;
  supportsPrepayment: boolean;
  status: MTLoanStatus;
  notes: string;
  systemCreatedAt: string;
  systemModifiedAt: string;
  etag: string;
}

export interface PaginatedLoans {
  value: Loan[];
  '@odata.count'?: number;
  '@odata.nextLink'?: string;
}
