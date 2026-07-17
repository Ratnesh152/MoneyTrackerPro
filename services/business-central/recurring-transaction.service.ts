import { env } from '@/config/env';
import { bcFetch } from './client';
import {
  RecurringTransaction,
  BCRecurringTransactionCreateDTO,
  BCRecurringTransactionUpdateDTO,
  BCRecurringTransactionResponseDTO,
  PaginatedRecurringTransactions,
} from '@/types/recurring-transaction.types';
import { unstable_noStore as noStore } from 'next/cache';

const RECURRING_TX_ENDPOINT = `/companies(${env.BC_COMPANY_ID})/recurringTransactions`;

function mapToDomain(dto: BCRecurringTransactionResponseDTO): RecurringTransaction {
  const cleanId = (id: string) => (id || '').replace(/[{}]/g, '').toLowerCase();
  return {
    etag: dto['@odata.etag'],
    systemId: cleanId(dto.systemId),
    entryNo: dto.entryNo,
    ownerEntraObjectId: cleanId(dto.ownerEntraObjectId),
    name: dto.name,
    transactionType: dto.transactionType,
    accountId: cleanId(dto.accountId),
    accountCode: dto.accountCode,
    categoryId: cleanId(dto.categoryId),
    categoryCode: dto.categoryCode,
    amount: dto.amount,
    startDate: dto.startDate,
    endDate: dto.endDate,
    frequency: dto.frequency,
    interval: dto.interval,
    nextRunDate: dto.nextRunDate,
    autoGenerate: dto.autoGenerate,
    active: dto.active,
    notes: dto.notes || '',
    systemCreatedAt: dto.systemCreatedAt,
    systemModifiedAt: dto.systemModifiedAt,
  };
}

export async function getRecurringTransactions(
  ownerEntraObjectId: string,
  searchParams?: {
    activeOnly?: boolean;
    top?: number;
    skip?: number;
  }
): Promise<PaginatedRecurringTransactions> {
  noStore();
  
  if (!ownerEntraObjectId) {
    throw new Error('Owner Entra Object ID is required');
  }

  const parts: string[] = [];
  parts.push(`$top=${searchParams?.top ?? 100}`);

  if (searchParams?.skip) {
    parts.push(`$skip=${searchParams.skip}`);
  }

  parts.push(`$orderby=nextRunDate asc`);
  parts.push(`$count=true`);

  const queryString = parts.length > 0 ? `?${parts.join('&')}` : '';
  const fullEndpoint = `/api/alletec/moneyTracker/v1.0${RECURRING_TX_ENDPOINT}${queryString}`;

  const response = await bcFetch(fullEndpoint);

  const cleanOid = ownerEntraObjectId.replace(/[{}]/g, '').toLowerCase();
  let filteredValue = (response.value || []).filter(
    (dto: BCRecurringTransactionResponseDTO) => (dto.ownerEntraObjectId || '').replace(/[{}]/g, '').toLowerCase() === cleanOid
  );

  if (searchParams?.activeOnly) {
    filteredValue = filteredValue.filter((dto: BCRecurringTransactionResponseDTO) => dto.active);
  }

  return {
    value: filteredValue.map(mapToDomain),
    '@odata.nextLink': response['@odata.nextLink'],
    '@odata.count': filteredValue.length,
  };
}

export async function getRecurringTransactionById(
  systemId: string,
  ownerEntraObjectId: string
): Promise<RecurringTransaction | null> {
  noStore();
  
  const endpoint = `/api/alletec/moneyTracker/v1.0${RECURRING_TX_ENDPOINT}(${systemId})`;
  
  try {
    const dto: BCRecurringTransactionResponseDTO = await bcFetch(endpoint);
    
    const dtoOid = dto.ownerEntraObjectId?.replace(/[{}]/g, '').toLowerCase();
    const reqOid = ownerEntraObjectId?.replace(/[{}]/g, '').toLowerCase();
    if (dtoOid !== reqOid) {
      throw new Error('NotFoundError');
    }
    
    return mapToDomain(dto);
  } catch (error) {
    const err = error as Error;
    if (err.name === 'NotFoundError') {
      return null;
    }
    throw error;
  }
}

export async function createRecurringTransaction(
  dto: BCRecurringTransactionCreateDTO
): Promise<RecurringTransaction> {
  const endpoint = `/api/alletec/moneyTracker/v1.0${RECURRING_TX_ENDPOINT}`;
  
  const response: BCRecurringTransactionResponseDTO = await bcFetch(endpoint, {
    method: 'POST',
    body: JSON.stringify(dto),
  });

  return mapToDomain(response);
}

export async function updateRecurringTransaction(
  systemId: string,
  ownerEntraObjectId: string,
  dto: BCRecurringTransactionUpdateDTO,
  etag: string
): Promise<RecurringTransaction> {
  await getRecurringTransactionById(systemId, ownerEntraObjectId);

  const endpoint = `/api/alletec/moneyTracker/v1.0${RECURRING_TX_ENDPOINT}(${systemId})`;
  
  const response: BCRecurringTransactionResponseDTO = await bcFetch(endpoint, {
    method: 'PATCH',
    headers: {
      'If-Match': etag,
    },
    body: JSON.stringify(dto),
  });

  return mapToDomain(response);
}

export async function deleteRecurringTransaction(
  systemId: string,
  ownerEntraObjectId: string,
  etag: string
): Promise<void> {
  await getRecurringTransactionById(systemId, ownerEntraObjectId);

  const endpoint = `/api/alletec/moneyTracker/v1.0${RECURRING_TX_ENDPOINT}(${systemId})`;
  
  await bcFetch(endpoint, {
    method: 'DELETE',
    headers: {
      'If-Match': etag,
    },
  });
}
