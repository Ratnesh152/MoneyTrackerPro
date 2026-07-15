import { env } from '@/config/env';
import { bcFetch } from './client';
import {
  Category,
  CategoryResponse,
} from '@/types/category.types';
import { unstable_noStore as noStore } from 'next/cache';

const CATEGORIES_ENDPOINT = `/companies(${env.BC_COMPANY_ID})/categories`;

export interface PaginatedCategories {
  value: Category[];
  '@odata.nextLink'?: string;
  '@odata.count'?: number;
}

export type BCCategoryCreateDTO = Omit<
  CategoryResponse,
  'systemId' | 'entryNo' | 'systemCreatedAt' | 'systemModifiedAt' | '@odata.etag'
>;

export type BCCategoryUpdateDTO = Partial<BCCategoryCreateDTO>;

/**
 * Maps a Business Central Category DTO to the Frontend Category Domain Model
 */
function mapToDomain(dto: CategoryResponse): Category {
  // BC returns GUIDs wrapped in curly braces {xxxxxxxx-...}; strip them
  const cleanId = (id: string) => (id || '').replace(/[{}]/g, '').toLowerCase();
  return {
    etag: dto['@odata.etag'],
    systemId: cleanId(dto.systemId),
    code: dto.code,
    name: dto.name,
    transactionType: dto.transactionType,
    isActive: dto.isActive,
    displayOrder: dto.displayOrder,
    colorCode: dto.colorCode || '',
    iconName: dto.iconName || '',
    ownerEntraObjectId: cleanId(dto.ownerEntraObjectId),
    systemCreatedAt: dto.systemCreatedAt,
    systemModifiedAt: dto.systemModifiedAt,
  };
}

/**
 * Get all categories for the current user
 */
export async function getCategories(
  ownerEntraObjectId: string,
  searchParams?: {
    search?: string;
    type?: string;
    isActive?: string;
    skip?: number;
    top?: number;
    sort?: string;
  }
): Promise<PaginatedCategories> {
  noStore();
  
  if (!ownerEntraObjectId) {
    throw new Error('Owner Entra Object ID is required');
  }

  const filters: string[] = [`ownerEntraObjectId eq '${ownerEntraObjectId}'`];

  if (searchParams?.search) {
    filters.push(`(contains(name,'${searchParams.search}') or contains(code,'${searchParams.search}'))`);
  }
  
  if (searchParams?.type) {
    filters.push(`transactionType eq '${searchParams.type}'`);
  }

  if (searchParams?.isActive) {
    filters.push(`isActive eq ${searchParams.isActive === 'true'}`);
  }

  // Build OData query string manually — URLSearchParams encodes $ as %24 which BC rejects
  // NOTE: ownerEntraObjectId is NOT filterable in BC. We fetch all and filter client-side.
  const parts: string[] = [];

  parts.push(`$top=${searchParams?.top ?? 50}`);

  if (searchParams?.skip) {
    parts.push(`$skip=${searchParams.skip}`);
  }

  if (searchParams?.sort) {
    const [field, order] = searchParams.sort.split('_');
    if (field && order) parts.push(`$orderby=${encodeURIComponent(`${field} ${order}`)}`);
  } else {
    parts.push(`$orderby=displayOrder%20asc%2C%20name%20asc`);
  }

  parts.push(`$count=true`);

  const queryString = parts.length > 0 ? `?${parts.join('&')}` : '';
  const fullEndpoint = `/api/alletec/moneyTracker/v1.0${CATEGORIES_ENDPOINT}${queryString}`;

  const response = await bcFetch(fullEndpoint);

  // Filter client-side — BC does not support filtering by ownerEntraObjectId via OData
  const cleanOid = ownerEntraObjectId.replace(/[{}]/g, '').toLowerCase();
  let filteredValue = (response.value || []).filter(
    (dto: CategoryResponse) => (dto.ownerEntraObjectId || '').replace(/[{}]/g, '').toLowerCase() === cleanOid
  );

  // Apply optional search/type/isActive filters client-side
  filteredValue = filteredValue.filter((dto: CategoryResponse) => {
    if (searchParams?.search) {
      const s = searchParams.search.toLowerCase();
      if (!dto.name?.toLowerCase().includes(s) && !dto.code?.toLowerCase().includes(s)) return false;
    }
    if (searchParams?.type && dto.transactionType !== searchParams.type) return false;
    if (searchParams?.isActive !== undefined) {
      const wantActive = searchParams.isActive === 'true';
      if (dto.isActive !== wantActive) return false;
    }
    return true;
  });

  return {
    value: filteredValue.map(mapToDomain),
    '@odata.nextLink': undefined,
    '@odata.count': filteredValue.length,
  };
}

/**
 * Get a specific category by SystemId
 */
export async function getCategoryById(
  systemId: string,
  ownerEntraObjectId: string
): Promise<Category | null> {
  noStore();
  
  const endpoint = `/api/alletec/moneyTracker/v1.0${CATEGORIES_ENDPOINT}(${systemId})`;
  
  try {
    const dto: CategoryResponse = await bcFetch(endpoint);
    
    // Authorization check – BC may return the GUID wrapped in { } braces
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
 * Create a new category
 */
export async function createCategory(
  dto: BCCategoryCreateDTO
): Promise<Category> {
  const endpoint = `/api/alletec/moneyTracker/v1.0${CATEGORIES_ENDPOINT}`;
  
  const response: CategoryResponse = await bcFetch(endpoint, {
    method: 'POST',
    body: JSON.stringify(dto),
  });

  return mapToDomain(response);
}

/**
 * Update an existing category
 */
export async function updateCategory(
  systemId: string,
  ownerEntraObjectId: string,
  dto: BCCategoryUpdateDTO,
  etag: string
): Promise<Category> {
  await getCategoryById(systemId, ownerEntraObjectId);

  const endpoint = `/api/alletec/moneyTracker/v1.0${CATEGORIES_ENDPOINT}(${systemId})`;
  
  const response: CategoryResponse = await bcFetch(endpoint, {
    method: 'PATCH',
    headers: {
      'If-Match': etag,
    },
    body: JSON.stringify(dto),
  });

  return mapToDomain(response);
}

/**
 * Delete a category
 */
export async function deleteCategory(
  systemId: string,
  ownerEntraObjectId: string,
  etag: string
): Promise<void> {
  await getCategoryById(systemId, ownerEntraObjectId);

  const endpoint = `/api/alletec/moneyTracker/v1.0${CATEGORIES_ENDPOINT}(${systemId})`;
  
  await bcFetch(endpoint, {
    method: 'DELETE',
    headers: {
      'If-Match': etag,
    },
  });
}
