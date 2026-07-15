import { bcFetch } from './client';
import {
  BCCreditCardResponseDTO,
  BCreditCardCreateDTO,
  BCreditCardUpdateDTO,
  CreditCard,
} from '@/types/credit-card.types';

const CREDIT_CARDS_ENDPOINT = '/creditCards';

// --- DTO Mappers ---

function mapBCCreditCardToCreditCard(dto: BCCreditCardResponseDTO): CreditCard {
  return {
    systemId: dto.systemId,
    ownerEntraObjectId: dto.ownerEntraObjectId,
    cardName: dto.cardName,
    issuingBank: dto.issuingBank,
    cardNetwork: dto.cardNetwork,
    last4Digits: dto.last4Digits,
    creditLimit: dto.creditLimit,
    currencyCode: dto.currencyCode,
    statementDay: dto.statementDay,
    dueDay: dto.dueDay,
    interestRate: dto.interestRate,
    annualFee: dto.annualFee,
    supportsEMI: dto.supportsEMI,
    isActive: dto.isActive,
    notes: dto.notes,
    systemCreatedAt: dto.systemCreatedAt,
    systemModifiedAt: dto.systemModifiedAt,
    etag: dto['@odata.etag'],
  };
}

export interface GetCreditCardsParams {
  search?: string;
  isActive?: boolean;
  network?: string;
  skip?: number;
  top?: number;
  sort?: string;
}

export interface PaginatedCreditCards {
  value: CreditCard[];
  '@odata.count'?: number;
  '@odata.nextLink'?: string;
}

export async function getCreditCards(
  ownerEntraObjectId: string,
  searchParams?: GetCreditCardsParams
): Promise<PaginatedCreditCards> {
  const parts: string[] = [];

  parts.push(`$top=${searchParams?.top ?? 50}`);

  if (searchParams?.skip) {
    parts.push(`$skip=${searchParams.skip}`);
  }

  if (searchParams?.sort) {
    const [field, order] = searchParams.sort.split('_');
    if (field && order) parts.push(`$orderby=${encodeURIComponent(`${field} ${order}`)}`);
  } else {
    parts.push(`$orderby=cardName%20asc`);
  }

  parts.push(`$count=true`);

  const queryString = parts.length > 0 ? `?${parts.join('&')}` : '';
  const fullEndpoint = `/api/alletec/moneyTracker/v1.0${CREDIT_CARDS_ENDPOINT}${queryString}`;

  const response = await bcFetch(fullEndpoint);

  // Apply Owner Isolation and optional Filters client-side
  // Business Central AL doesn't allow filtering effectively by GUID ownerEntraObjectId directly in the API for some reason.
  const cleanOid = ownerEntraObjectId.replace(/[{}]/g, '').toLowerCase();
  let filteredValue = (response.value || []).filter(
    (dto: BCCreditCardResponseDTO) => (dto.ownerEntraObjectId || '').replace(/[{}]/g, '').toLowerCase() === cleanOid
  );

  // Filters
  filteredValue = filteredValue.filter((dto: BCCreditCardResponseDTO) => {
    if (searchParams?.search) {
      const q = searchParams.search.toLowerCase();
      const matchesSearch = 
        dto.cardName?.toLowerCase().includes(q) || 
        dto.issuingBank?.toLowerCase().includes(q) || 
        dto.last4Digits?.includes(q);
      if (!matchesSearch) return false;
    }
    
    if (searchParams?.isActive !== undefined && dto.isActive !== searchParams.isActive) {
      return false;
    }
    
    if (searchParams?.network && dto.cardNetwork !== searchParams.network) {
      return false;
    }

    return true;
  });

  return {
    ...response,
    value: filteredValue.map(mapBCCreditCardToCreditCard),
    '@odata.count': filteredValue.length,
  };
}

export async function getCreditCard(
  systemId: string,
  ownerEntraObjectId: string
): Promise<CreditCard | null> {
  const endpoint = `/api/alletec/moneyTracker/v1.0${CREDIT_CARDS_ENDPOINT}(${systemId})`;
  
  try {
    const response = await bcFetch(endpoint);
    const dto = response as BCCreditCardResponseDTO;

    const cleanReqOid = ownerEntraObjectId.replace(/[{}]/g, '').toLowerCase();
    const cleanResOid = (dto.ownerEntraObjectId || '').replace(/[{}]/g, '').toLowerCase();
    if (cleanReqOid !== cleanResOid) {
      return null; // Owner isolation enforced
    }

    return mapBCCreditCardToCreditCard(dto);
  } catch (error: any) {
    if (error.statusCode === 404) return null;
    throw error;
  }
}

export async function createCreditCard(data: BCreditCardCreateDTO): Promise<CreditCard> {
  // Pre-flight Duplicate Validation
  const existingCards = await getCreditCards(data.ownerEntraObjectId);
  
  const duplicate = existingCards.value.find(
    (c: CreditCard) => c.issuingBank.toLowerCase() === data.issuingBank.toLowerCase() && 
         c.last4Digits === data.last4Digits
  );

  if (duplicate) {
    throw new Error('A credit card from this Issuing Bank with these Last 4 Digits already exists.');
  }

  if (data.statementDay === data.dueDay) {
    throw new Error('Statement Day cannot be the same as Due Day.');
  }

  const endpoint = `/api/alletec/moneyTracker/v1.0${CREDIT_CARDS_ENDPOINT}`;
  const response = await bcFetch(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });

  return mapBCCreditCardToCreditCard(response as BCCreditCardResponseDTO);
}

export async function updateCreditCard(
  systemId: string,
  ownerEntraObjectId: string,
  data: BCreditCardUpdateDTO,
  etag: string
): Promise<CreditCard> {
  // Owner isolation check before update
  const existingCard = await getCreditCard(systemId, ownerEntraObjectId);
  if (!existingCard) {
    throw new Error('Credit Card not found or access denied.');
  }

  // Pre-flight duplicate validation if issuing bank or last4digits are being updated
  if (data.issuingBank || data.last4Digits) {
    const allCards = await getCreditCards(ownerEntraObjectId);
    const newBank = data.issuingBank || existingCard.issuingBank;
    const newDigits = data.last4Digits || existingCard.last4Digits;

    const duplicate = allCards.value.find(
      (c: CreditCard) => c.systemId !== systemId && 
           c.issuingBank.toLowerCase() === newBank.toLowerCase() && 
           c.last4Digits === newDigits
    );

    if (duplicate) {
      throw new Error('Another credit card from this Issuing Bank with these Last 4 Digits already exists.');
    }
  }

  // Pre-flight statement vs due day validation
  const newStatementDay = data.statementDay ?? existingCard.statementDay;
  const newDueDay = data.dueDay ?? existingCard.dueDay;
  
  if (newStatementDay === newDueDay) {
    throw new Error('Statement Day cannot be the same as Due Day.');
  }

  const endpoint = `/api/alletec/moneyTracker/v1.0${CREDIT_CARDS_ENDPOINT}(${systemId})`;
  const response = await bcFetch(endpoint, {
    method: 'PATCH',
    headers: {
      'If-Match': etag,
    },
    body: JSON.stringify(data),
  });

  return mapBCCreditCardToCreditCard(response as BCCreditCardResponseDTO);
}

export async function deleteCreditCard(
  systemId: string,
  ownerEntraObjectId: string,
  etag: string
): Promise<void> {
  // Owner isolation check
  const existingCard = await getCreditCard(systemId, ownerEntraObjectId);
  if (!existingCard) {
    throw new Error('Credit Card not found or access denied.');
  }

  const endpoint = `/api/alletec/moneyTracker/v1.0${CREDIT_CARDS_ENDPOINT}(${systemId})`;
  await bcFetch(endpoint, {
    method: 'DELETE',
    headers: {
      'If-Match': etag,
    },
  });
}
