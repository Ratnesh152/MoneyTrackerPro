export type InvestmentType = 
  | 'FixedDeposit'
  | 'RecurringDeposit'
  | 'SIP'
  | 'MutualFund'
  | 'Stock'
  | 'Gold'
  | 'Crypto'
  | 'Custom';

export type InvestmentStatus = 
  | 'Active'
  | 'Matured'
  | 'Closed'
  | 'Sold';

export interface Investment {
  systemId: string;
  entryNo: number;
  ownerEntraObjectId: string;
  name: string;
  type: InvestmentType;
  investedAmount: number;
  currentValue: number;
  status: InvestmentStatus;
  notes?: string;
  systemCreatedAt: string;
  systemModifiedAt: string;
  etag: string;
}

export interface BCInvestmentCreateDTO {
  ownerEntraObjectId: string;
  name: string;
  type: InvestmentType;
  investedAmount: number;
  currentValue: number;
  status: InvestmentStatus;
  notes?: string;
}

export interface BCInvestmentUpdateDTO {
  name?: string;
  type?: InvestmentType;
  investedAmount?: number;
  currentValue?: number;
  status?: InvestmentStatus;
  notes?: string;
}

export interface InvestmentAnalytics {
  profitOrLoss: number;
  returnPercentage: number;
  isProfitable: boolean;
}
