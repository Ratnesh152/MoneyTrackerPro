import { env } from '@/config/env';
import { bcFetch } from './client';
import {
  RecurringExecution,
  BCRecurringExecutionCreateDTO,
  BCRecurringExecutionResponseDTO,
  PaginatedRecurringExecutions,
} from '@/types/recurring-transaction.types';
import { unstable_noStore as noStore } from 'next/cache';

const RECURRING_EXEC_ENDPOINT = `/companies(${env.BC_COMPANY_ID})/recurringExecutions`;

function mapToDomain(dto: BCRecurringExecutionResponseDTO): RecurringExecution {
  const cleanId = (id: string) => (id || '').replace(/[{}]/g, '').toLowerCase();
  return {
    etag: dto['@odata.etag'],
    systemId: cleanId(dto.systemId),
    entryNo: dto.entryNo,
    ownerEntraObjectId: cleanId(dto.ownerEntraObjectId),
    recurringTransactionSystemId: cleanId(dto.recurringTransactionSystemId),
    generatedTransactionSystemId: cleanId(dto.generatedTransactionSystemId),
    scheduledDate: dto.scheduledDate,
    generatedDateTime: dto.generatedDateTime,
    status: dto.status,
    errorMessage: dto.errorMessage || '',
    systemCreatedAt: dto.systemCreatedAt,
    systemModifiedAt: dto.systemModifiedAt,
  };
}

export async function getRecurringExecutions(
  ownerEntraObjectId: string,
  searchParams?: {
    recurringTransactionSystemId?: string;
    top?: number;
    skip?: number;
  }
): Promise<PaginatedRecurringExecutions> {
  noStore();
  
  if (!ownerEntraObjectId) {
    throw new Error('Owner Entra Object ID is required');
  }

  const parts: string[] = [];
  parts.push(`$top=${searchParams?.top ?? 100}`);

  if (searchParams?.skip) {
    parts.push(`$skip=${searchParams.skip}`);
  }

  parts.push(`$orderby=scheduledDate desc`);
  parts.push(`$count=true`);

  const queryString = parts.length > 0 ? `?${parts.join('&')}` : '';
  const fullEndpoint = `/api/alletec/moneyTracker/v1.0${RECURRING_EXEC_ENDPOINT}${queryString}`;

  const response = await bcFetch(fullEndpoint);

  const cleanOid = ownerEntraObjectId.replace(/[{}]/g, '').toLowerCase();
  let filteredValue = (response.value || []).filter(
    (dto: BCRecurringExecutionResponseDTO) => (dto.ownerEntraObjectId || '').replace(/[{}]/g, '').toLowerCase() === cleanOid
  );

  if (searchParams?.recurringTransactionSystemId) {
    const cleanSystemId = searchParams.recurringTransactionSystemId.replace(/[{}]/g, '').toLowerCase();
    filteredValue = filteredValue.filter(
      (dto: BCRecurringExecutionResponseDTO) => (dto.recurringTransactionSystemId || '').replace(/[{}]/g, '').toLowerCase() === cleanSystemId
    );
  }

  return {
    value: filteredValue.map(mapToDomain),
    '@odata.nextLink': response['@odata.nextLink'],
    '@odata.count': filteredValue.length,
  };
}

export async function createRecurringExecution(
  dto: BCRecurringExecutionCreateDTO
): Promise<RecurringExecution> {
  const endpoint = `/api/alletec/moneyTracker/v1.0${RECURRING_EXEC_ENDPOINT}`;
  
  const response: BCRecurringExecutionResponseDTO = await bcFetch(endpoint, {
    method: 'POST',
    body: JSON.stringify(dto),
  });

  return mapToDomain(response);
}
