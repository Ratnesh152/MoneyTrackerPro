import { env } from '@/config/env';
import { bcFetch } from './client';
import {
  Budget,
  BCBudgetCreateDTO,
  BCBudgetUpdateDTO,
  BCBudgetResponseDTO,
  PaginatedBudgets,
} from '@/types/budget.types';
import { unstable_noStore as noStore } from 'next/cache';

const BUDGETS_ENDPOINT = `/companies(${env.BC_COMPANY_ID})/budgets`;

/**
 * Maps a Business Central Budget DTO to the Frontend Budget Domain Model
 */
function mapToDomain(dto: BCBudgetResponseDTO): Budget {
  const cleanId = (id: string) => (id || '').replace(/[{}]/g, '').toLowerCase();
  return {
    etag: dto['@odata.etag'],
    systemId: cleanId(dto.systemId),
    entryNo: dto.entryNo,
    ownerEntraObjectId: cleanId(dto.ownerEntraObjectId),
    categoryId: cleanId(dto.categoryId),
    budgetMonth: dto.budgetMonth,
    budgetYear: dto.budgetYear,
    budgetAmount: dto.budgetAmount,
    notes: dto.notes || '',
    systemCreatedAt: dto.systemCreatedAt,
    systemModifiedAt: dto.systemModifiedAt,
  };
}

/**
 * Get all budgets for the current user
 */
export async function getBudgets(
  ownerEntraObjectId: string,
  searchParams?: {
    categoryId?: string;
    budgetMonth?: number;
    budgetYear?: number;
    skip?: number;
    top?: number;
  }
): Promise<PaginatedBudgets> {
  noStore();
  
  if (!ownerEntraObjectId) {
    throw new Error('Owner Entra Object ID is required');
  }

  const parts: string[] = [];
  parts.push(`$top=${searchParams?.top ?? 50}`);

  if (searchParams?.skip) {
    parts.push(`$skip=${searchParams.skip}`);
  }

  parts.push(`$count=true`);

  const queryString = parts.length > 0 ? `?${parts.join('&')}` : '';
  const fullEndpoint = `/api/alletec/moneyTracker/v1.0${BUDGETS_ENDPOINT}${queryString}`;

  const response = await bcFetch(fullEndpoint);

  // Filter client-side for Owner Isolation
  const cleanOid = ownerEntraObjectId.replace(/[{}]/g, '').toLowerCase();
  let filteredValue = (response.value || []).filter(
    (dto: BCBudgetResponseDTO) => (dto.ownerEntraObjectId || '').replace(/[{}]/g, '').toLowerCase() === cleanOid
  );

  // Apply optional filters
  filteredValue = filteredValue.filter((dto: BCBudgetResponseDTO) => {
    if (searchParams?.categoryId) {
      const qCat = searchParams.categoryId.replace(/[{}]/g, '').toLowerCase();
      const dCat = (dto.categoryId || '').replace(/[{}]/g, '').toLowerCase();
      if (qCat !== dCat) return false;
    }
    if (searchParams?.budgetMonth && dto.budgetMonth !== searchParams.budgetMonth) return false;
    if (searchParams?.budgetYear && dto.budgetYear !== searchParams.budgetYear) return false;
    return true;
  });

  return {
    value: filteredValue.map(mapToDomain),
    '@odata.nextLink': response['@odata.nextLink'],
    '@odata.count': filteredValue.length,
  };
}

/**
 * Get a specific budget by SystemId
 */
export async function getBudgetById(
  systemId: string,
  ownerEntraObjectId: string
): Promise<Budget | null> {
  noStore();
  
  const endpoint = `/api/alletec/moneyTracker/v1.0${BUDGETS_ENDPOINT}(${systemId})`;
  
  try {
    const dto: BCBudgetResponseDTO = await bcFetch(endpoint);
    
    // Authorization check
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

/**
 * Create a new budget
 */
export async function createBudget(
  dto: BCBudgetCreateDTO
): Promise<Budget> {
  // Pre-flight check: Business Rule uniqueness
  const existing = await getBudgets(dto.ownerEntraObjectId, {
    categoryId: dto.categoryId,
    budgetMonth: dto.budgetMonth,
    budgetYear: dto.budgetYear
  });
  
  if (existing.value && existing.value.length > 0) {
    throw new Error('A budget for this category, month, and year already exists.');
  }

  const endpoint = `/api/alletec/moneyTracker/v1.0${BUDGETS_ENDPOINT}`;
  
  const response: BCBudgetResponseDTO = await bcFetch(endpoint, {
    method: 'POST',
    body: JSON.stringify(dto),
  });

  return mapToDomain(response);
}

/**
 * Update an existing budget
 */
export async function updateBudget(
  systemId: string,
  ownerEntraObjectId: string,
  dto: BCBudgetUpdateDTO,
  etag: string
): Promise<Budget> {
  // Verify ownership
  await getBudgetById(systemId, ownerEntraObjectId);

  const endpoint = `/api/alletec/moneyTracker/v1.0${BUDGETS_ENDPOINT}(${systemId})`;
  
  const response: BCBudgetResponseDTO = await bcFetch(endpoint, {
    method: 'PATCH',
    headers: {
      'If-Match': etag,
    },
    body: JSON.stringify(dto),
  });

  return mapToDomain(response);
}

/**
 * Delete a budget
 */
export async function deleteBudget(
  systemId: string,
  ownerEntraObjectId: string,
  etag: string
): Promise<boolean> {
  // Verify ownership
  await getBudgetById(systemId, ownerEntraObjectId);

  const endpoint = `/api/alletec/moneyTracker/v1.0${BUDGETS_ENDPOINT}(${systemId})`;
  
  await bcFetch(endpoint, {
    method: 'DELETE',
    headers: {
      'If-Match': etag,
    },
  });

  return true;
}
