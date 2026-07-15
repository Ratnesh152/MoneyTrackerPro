import { env } from '@/config/env';
import { bcFetch } from './client';
import {
  Account,
  BCAccountCreateDTO,
  BCAccountUpdateDTO,
  BCAccountResponseDTO,
  PaginatedAccounts,
} from '@/types/account.types';
import { unstable_noStore as noStore } from 'next/cache';

const ACCOUNTS_ENDPOINT = `/companies(${env.BC_COMPANY_ID})/accounts`;

/**
 * Maps a Business Central Account DTO to the Frontend Account Domain Model
 */
function mapToDomain(dto: BCAccountResponseDTO): Account {
  // BC returns GUIDs wrapped in curly braces {xxxxxxxx-...}; strip them
  const cleanId = (id: string) => (id || '').replace(/[{}]/g, '').toLowerCase();
  return {
    etag: dto['@odata.etag'],
    systemId: cleanId(dto.systemId),
    entryNo: dto.entryNo,
    ownerEntraObjectId: cleanId(dto.ownerEntraObjectId),
    name: dto.name,
    accountType: dto.accountType,
    openingBalance: dto.openingBalance,
    currencyCode: dto.currencyCode || '',
    isDefault: dto.isDefault,
    notes: dto.notes || '',
    systemCreatedAt: dto.systemCreatedAt,
    systemModifiedAt: dto.systemModifiedAt,
  };
}

/**
 * Get all accounts for the current user
 */
export async function getAccounts(
  ownerEntraObjectId: string,
  searchParams?: {
    search?: string;
    type?: string;
    skip?: number;
    top?: number;
    sort?: string;
  }
): Promise<PaginatedAccounts> {
  noStore();
  
  if (!ownerEntraObjectId) {
    throw new Error('Owner Entra Object ID is required');
  }

  const filters: string[] = [`ownerEntraObjectId eq '${ownerEntraObjectId}'`];

  if (searchParams?.search) {
    filters.push(`contains(name,'${searchParams.search}')`);
  }
  
  if (searchParams?.type) {
    filters.push(`accountType eq '${searchParams.type}'`);
  }

  // Build OData query string manually — URLSearchParams encodes $ as %24 which BC rejects
  // NOTE: ownerEntraObjectId is NOT filterable in BC (FilterAllowed not set in AL).
  // We fetch all records and filter client-side.
  const parts: string[] = [];

  parts.push(`$top=${searchParams?.top ?? 50}`);

  if (searchParams?.skip) {
    parts.push(`$skip=${searchParams.skip}`);
  }

  if (searchParams?.sort) {
    const [field, order] = searchParams.sort.split('_');
    if (field && order) parts.push(`$orderby=${encodeURIComponent(`${field} ${order}`)}`);
  } else {
    parts.push(`$orderby=name%20asc`);
  }

  parts.push(`$count=true`);

  const queryString = parts.length > 0 ? `?${parts.join('&')}` : '';
  const fullEndpoint = `/api/alletec/moneyTracker/v1.0${ACCOUNTS_ENDPOINT}${queryString}`;

  const response = await bcFetch(fullEndpoint);

  // Filter client-side — BC does not support filtering by ownerEntraObjectId via OData
  const cleanOid = ownerEntraObjectId.replace(/[{}]/g, '').toLowerCase();
  const filteredValue = (response.value || []).filter(
    (dto: BCAccountResponseDTO) => (dto.ownerEntraObjectId || '').replace(/[{}]/g, '').toLowerCase() === cleanOid
  );

  // Apply optional search/type filters client-side too
  const finalValue = filteredValue.filter((dto: BCAccountResponseDTO) => {
    if (searchParams?.search && !dto.name?.toLowerCase().includes(searchParams.search.toLowerCase())) return false;
    if (searchParams?.type && dto.accountType !== searchParams.type) return false;
    return true;
  });

  return {
    value: finalValue.map(mapToDomain),
    '@odata.nextLink': response['@odata.nextLink'],
    '@odata.count': finalValue.length,
  };
}

/**
 * Get a specific account by SystemId
 */
export async function getAccountById(
  systemId: string,
  ownerEntraObjectId: string
): Promise<Account | null> {
  noStore();
  
  const endpoint = `/api/alletec/moneyTracker/v1.0${ACCOUNTS_ENDPOINT}(${systemId})`;
  
  try {
    const dto: BCAccountResponseDTO = await bcFetch(endpoint);
    
    // Authorization check – BC may return the GUID wrapped in { } braces
    const dtoOid = dto.ownerEntraObjectId?.replace(/[{}]/g, '').toLowerCase();
    const reqOid = ownerEntraObjectId?.replace(/[{}]/g, '').toLowerCase();
    if (dtoOid !== reqOid) {
      throw new Error('NotFoundError'); // Obfuscate unauthorized access
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

/**
 * Create a new account
 */
export async function createAccount(
  dto: BCAccountCreateDTO
): Promise<Account> {
  const endpoint = `/api/alletec/moneyTracker/v1.0${ACCOUNTS_ENDPOINT}`;
  
  const response: BCAccountResponseDTO = await bcFetch(endpoint, {
    method: 'POST',
    body: JSON.stringify(dto),
  });

  return mapToDomain(response);
}

/**
 * Update an existing account
 */
export async function updateAccount(
  systemId: string,
  ownerEntraObjectId: string,
  dto: BCAccountUpdateDTO,
  etag: string
): Promise<Account> {
  // First, verify ownership to prevent IDOR
  await getAccountById(systemId, ownerEntraObjectId);

  const endpoint = `/api/alletec/moneyTracker/v1.0${ACCOUNTS_ENDPOINT}(${systemId})`;
  
  const response: BCAccountResponseDTO = await bcFetch(endpoint, {
    method: 'PATCH',
    headers: {
      'If-Match': etag,
    },
    body: JSON.stringify(dto),
  });

  return mapToDomain(response);
}

/**
 * Delete an account
 */
export async function deleteAccount(
  systemId: string,
  ownerEntraObjectId: string,
  etag: string
): Promise<void> {
  // First, verify ownership to prevent IDOR
  await getAccountById(systemId, ownerEntraObjectId);

  const endpoint = `/api/alletec/moneyTracker/v1.0${ACCOUNTS_ENDPOINT}(${systemId})`;
  
  await bcFetch(endpoint, {
    method: 'DELETE',
    headers: {
      'If-Match': etag,
    },
  });
}
