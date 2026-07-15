export type MTCreditCardNetwork = 'Visa' | 'MasterCard' | 'RuPay' | 'Amex' | 'Discover' | 'Other';

export interface BCCreditCardResponseDTO {
  systemId: string;
  entryNo: number;
  ownerEntraObjectId: string;
  cardName: string;
  issuingBank: string;
  cardNetwork: MTCreditCardNetwork;
  last4Digits: string;
  creditLimit: number;
  currencyCode: string;
  statementDay: number;
  dueDay: number;
  interestRate: number;
  annualFee: number;
  supportsEMI: boolean;
  isActive: boolean;
  notes: string;
  systemCreatedAt: string;
  systemModifiedAt: string;
  '@odata.etag': string;
}

export interface BCreditCardCreateDTO {
  ownerEntraObjectId: string;
  cardName: string;
  issuingBank: string;
  cardNetwork: MTCreditCardNetwork;
  last4Digits: string;
  creditLimit: number;
  currencyCode: string;
  statementDay: number;
  dueDay: number;
  interestRate?: number;
  annualFee?: number;
  supportsEMI?: boolean;
  isActive?: boolean;
  notes?: string;
}

export interface BCreditCardUpdateDTO {
  cardName?: string;
  issuingBank?: string;
  cardNetwork?: MTCreditCardNetwork;
  last4Digits?: string;
  creditLimit?: number;
  currencyCode?: string;
  statementDay?: number;
  dueDay?: number;
  interestRate?: number;
  annualFee?: number;
  supportsEMI?: boolean;
  isActive?: boolean;
  notes?: string;
}

export interface CreditCard {
  systemId: string;
  ownerEntraObjectId: string;
  cardName: string;
  issuingBank: string;
  cardNetwork: MTCreditCardNetwork;
  last4Digits: string;
  creditLimit: number;
  currencyCode: string;
  statementDay: number;
  dueDay: number;
  interestRate: number;
  annualFee: number;
  supportsEMI: boolean;
  isActive: boolean;
  notes: string;
  systemCreatedAt: string;
  systemModifiedAt: string;
  etag: string;
}
