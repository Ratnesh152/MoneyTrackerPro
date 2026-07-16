export type MTLoanPaymentMethod = 'Bank Transfer' | 'UPI' | 'Cash' | 'Cheque' | 'Auto Debit' | 'Card' | 'Other';
export type MTLoanPaymentStatus = 'Pending' | 'Paid' | 'Partially Paid' | 'Skipped' | 'Cancelled';

export interface BCLoanPaymentResponseDTO {
  systemId: string;
  entryNo: number;
  ownerEntraObjectId: string;
  loanSystemId: string;
  paymentDate: string;
  emiNumber: number;
  amountPaid: number;
  paymentMethod: MTLoanPaymentMethod;
  transactionReference: string;
  notes: string;
  status: MTLoanPaymentStatus;
  systemCreatedAt: string;
  systemModifiedAt: string;
  '@odata.etag': string;
}

export interface BCLoanPaymentCreateDTO {
  ownerEntraObjectId: string;
  loanSystemId: string;
  paymentDate: string;
  emiNumber: number;
  amountPaid: number;
  paymentMethod: MTLoanPaymentMethod;
  transactionReference?: string;
  notes?: string;
  status?: MTLoanPaymentStatus;
}

export interface BCLoanPaymentUpdateDTO {
  paymentDate?: string;
  emiNumber?: number;
  amountPaid?: number;
  paymentMethod?: MTLoanPaymentMethod;
  transactionReference?: string;
  notes?: string;
  status?: MTLoanPaymentStatus;
}

export interface LoanPayment {
  systemId: string;
  entryNo: number;
  ownerEntraObjectId: string;
  loanSystemId: string;
  paymentDate: string;
  emiNumber: number;
  amountPaid: number;
  paymentMethod: MTLoanPaymentMethod;
  transactionReference: string;
  notes: string;
  status: MTLoanPaymentStatus;
  systemCreatedAt: string;
  systemModifiedAt: string;
  etag: string;
}

export interface PaginatedLoanPayments {
  value: LoanPayment[];
  '@odata.count'?: number;
  '@odata.nextLink'?: string;
}

export interface LoanPaymentHistoryEntry extends LoanPayment {
  dueDate: string;
  daysLate: number;
  remainingBalanceAfterPayment: number;
}
