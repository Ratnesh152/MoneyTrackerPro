export interface AccountInput {
  name: string;
  accountType: 'Cash' | 'Bank' | 'Wallet';
  openingBalance: number;
  currencyCode?: string | null;
  isDefault: boolean;
  notes?: string | null;
}

export interface BCAccountCreateDTO {
  ownerEntraObjectId: string;
  name: string;
  accountType: 'Cash' | 'Bank' | 'Wallet';
  openingBalance: number;
  currencyCode?: string;
  isDefault: boolean;
  notes?: string;
}

export interface BCAccountUpdateDTO {
  name?: string;
  accountType?: 'Cash' | 'Bank' | 'Wallet';
  openingBalance?: number;
  currencyCode?: string;
  isDefault?: boolean;
  notes?: string;
}

export interface BCAccountResponseDTO {
  '@odata.etag': string;
  systemId: string;
  entryNo: number;
  ownerEntraObjectId: string;
  name: string;
  accountType: 'Cash' | 'Bank' | 'Wallet';
  openingBalance: number;
  currencyCode: string;
  isDefault: boolean;
  notes: string;
  systemCreatedAt: string;
  systemModifiedAt: string;
}

export interface Account {
  etag: string;
  systemId: string;
  entryNo: number;
  ownerEntraObjectId: string;
  name: string;
  accountType: 'Cash' | 'Bank' | 'Wallet';
  openingBalance: number;
  currencyCode: string;
  isDefault: boolean;
  notes: string;
  systemCreatedAt: string;
  systemModifiedAt: string;
}

export interface PaginatedAccounts {
  value: Account[];
  '@odata.nextLink'?: string;
  '@odata.count'?: number;
}
