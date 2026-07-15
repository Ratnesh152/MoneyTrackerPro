import { bcFetch } from './client';
import {
  BCLoanResponseDTO,
  BCLoanCreateDTO,
  BCLoanUpdateDTO,
  Loan,
  PaginatedLoans
} from '@/types/loan.types';

const LOANS_ENDPOINT = '/loans';

// --- DTO Mappers ---

function mapBCLoanToLoan(dto: BCLoanResponseDTO): Loan {
  return {
    systemId: dto.systemId,
    ownerEntraObjectId: dto.ownerEntraObjectId,
    loanName: dto.loanName,
    lenderName: dto.lenderName,
    loanType: dto.loanType,
    principalAmount: dto.principalAmount,
    interestRate: dto.interestRate,
    tenureMonths: dto.tenureMonths,
    emiAmount: dto.emiAmount,
    startDate: dto.startDate,
    loanAccountNumber: dto.loanAccountNumber,
    currencyCode: dto.currencyCode,
    supportsPrepayment: dto.supportsPrepayment,
    status: dto.status,
    notes: dto.notes,
    systemCreatedAt: dto.systemCreatedAt,
    systemModifiedAt: dto.systemModifiedAt,
    etag: dto['@odata.etag'],
  };
}

export interface GetLoansParams {
  search?: string;
  status?: string;
  loanType?: string;
  skip?: number;
  top?: number;
  sort?: string;
}

export async function getLoans(
  ownerEntraObjectId: string,
  searchParams?: GetLoansParams
): Promise<PaginatedLoans> {
  const filterParts: string[] = [];

  // Owner isolation — always filter server-side
  const cleanOid = ownerEntraObjectId.replace(/[{}]/g, '');
  filterParts.push(`ownerEntraObjectId eq '${cleanOid}'`);

  // Status filter
  if (searchParams?.status && searchParams.status !== 'all') {
    filterParts.push(`status eq '${searchParams.status}'`);
  }

  // Loan type filter
  if (searchParams?.loanType && searchParams.loanType !== 'all') {
    filterParts.push(`loanType eq '${searchParams.loanType}'`);
  }

  // Search filter (loanName or lenderName contains)
  if (searchParams?.search) {
    const q = searchParams.search.replace(/'/g, "''"); // escape single quotes
    filterParts.push(`(contains(tolower(loanName),'${q.toLowerCase()}') or contains(tolower(lenderName),'${q.toLowerCase()}'))`);
  }

  const parts: string[] = [];

  parts.push(`$filter=${encodeURIComponent(filterParts.join(' and '))}`);
  parts.push(`$top=${searchParams?.top ?? 50}`);

  if (searchParams?.skip) {
    parts.push(`$skip=${searchParams.skip}`);
  }

  if (searchParams?.sort) {
    const [field, order] = searchParams.sort.split('_');
    if (field && order) parts.push(`$orderby=${encodeURIComponent(`${field} ${order}`)}`);
  } else {
    parts.push(`$orderby=loanName%20asc`);
  }

  parts.push(`$count=true`);

  const queryString = `?${parts.join('&')}`;
  const fullEndpoint = `/api/alletec/moneyTracker/v1.0${LOANS_ENDPOINT}${queryString}`;

  const response = await bcFetch(fullEndpoint);

  return {
    value: (response.value || []).map(mapBCLoanToLoan),
    '@odata.count': response['@odata.count'] ?? (response.value || []).length,
    '@odata.nextLink': response['@odata.nextLink'],
  };
}

export async function getLoan(
  systemId: string,
  ownerEntraObjectId: string
): Promise<Loan | null> {
  const endpoint = `/api/alletec/moneyTracker/v1.0${LOANS_ENDPOINT}(${systemId})`;
  
  try {
    const response = await bcFetch(endpoint);
    const dto = response as BCLoanResponseDTO;

    const cleanReqOid = ownerEntraObjectId.replace(/[{}]/g, '').toLowerCase();
    const cleanResOid = (dto.ownerEntraObjectId || '').replace(/[{}]/g, '').toLowerCase();
    if (cleanReqOid !== cleanResOid) {
      return null; // Owner isolation enforced
    }

    return mapBCLoanToLoan(dto);
  } catch (error: any) {
    if (error.statusCode === 404) return null;
    throw error;
  }
}

export async function createLoan(data: BCLoanCreateDTO): Promise<Loan> {
  // Pre-flight Duplicate Validation
  const existingLoans = await getLoans(data.ownerEntraObjectId);
  
  const duplicate = existingLoans.value.find(
    (l: Loan) => l.loanAccountNumber.toLowerCase() === data.loanAccountNumber.toLowerCase()
  );

  if (duplicate) {
    throw new Error('A loan with this Account Number already exists.');
  }

  const endpoint = `/api/alletec/moneyTracker/v1.0${LOANS_ENDPOINT}`;
  const response = await bcFetch(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });

  return mapBCLoanToLoan(response as BCLoanResponseDTO);
}

export async function updateLoan(
  systemId: string,
  ownerEntraObjectId: string,
  data: BCLoanUpdateDTO,
  etag: string
): Promise<Loan> {
  // Owner isolation check before update
  const existingLoan = await getLoan(systemId, ownerEntraObjectId);
  if (!existingLoan) {
    throw new Error('Loan not found or access denied.');
  }

  if (data.loanAccountNumber) {
    const allLoans = await getLoans(ownerEntraObjectId);
    const newAccountNumber = data.loanAccountNumber || existingLoan.loanAccountNumber;

    const duplicate = allLoans.value.find(
      (l: Loan) => l.systemId !== systemId && 
                   l.loanAccountNumber.toLowerCase() === newAccountNumber.toLowerCase()
    );

    if (duplicate) {
      throw new Error('Another loan with this Account Number already exists.');
    }
  }

  const endpoint = `/api/alletec/moneyTracker/v1.0${LOANS_ENDPOINT}(${systemId})`;
  const response = await bcFetch(endpoint, {
    method: 'PATCH',
    headers: {
      'If-Match': etag,
    },
    body: JSON.stringify(data),
  });

  return mapBCLoanToLoan(response as BCLoanResponseDTO);
}

export async function deleteLoan(
  systemId: string,
  ownerEntraObjectId: string,
  etag: string
): Promise<void> {
  // Owner isolation check
  const existingLoan = await getLoan(systemId, ownerEntraObjectId);
  if (!existingLoan) {
    throw new Error('Loan not found or access denied.');
  }

  const endpoint = `/api/alletec/moneyTracker/v1.0${LOANS_ENDPOINT}(${systemId})`;
  await bcFetch(endpoint, {
    method: 'DELETE',
    headers: {
      'If-Match': etag,
    },
  });
}
