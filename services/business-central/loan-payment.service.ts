import { bcFetch } from './client';
import {
  BCLoanPaymentResponseDTO,
  BCLoanPaymentCreateDTO,
  BCLoanPaymentUpdateDTO,
  LoanPayment,
  PaginatedLoanPayments,
  MTLoanPaymentStatus
} from '@/types/loan-payment.types';

const LOAN_PAYMENTS_ENDPOINT = '/loanPayments';

function mapBCLoanPaymentToLoanPayment(dto: BCLoanPaymentResponseDTO): LoanPayment {
  return {
    systemId: dto.systemId,
    entryNo: dto.entryNo,
    ownerEntraObjectId: dto.ownerEntraObjectId,
    loanSystemId: dto.loanSystemId,
    paymentDate: dto.paymentDate,
    emiNumber: dto.emiNumber,
    amountPaid: dto.amountPaid,
    paymentMethod: dto.paymentMethod,
    transactionReference: dto.transactionReference,
    notes: dto.notes,
    status: dto.status,
    systemCreatedAt: dto.systemCreatedAt,
    systemModifiedAt: dto.systemModifiedAt,
    etag: dto['@odata.etag'],
  };
}

export interface GetLoanPaymentsParams {
  loanSystemId?: string;
  status?: MTLoanPaymentStatus;
  fromDate?: string;
  toDate?: string;
  skip?: number;
  top?: number;
  sort?: string;
}

export async function getLoanPayments(
  ownerEntraObjectId: string,
  searchParams?: GetLoanPaymentsParams
): Promise<PaginatedLoanPayments> {
  const filterParts: string[] = [];

  const cleanOid = ownerEntraObjectId.replace(/[{}]/g, '');
  filterParts.push(`ownerEntraObjectId eq '${cleanOid}'`);

  if (searchParams?.loanSystemId) {
    const cleanLoanId = searchParams.loanSystemId.replace(/[{}]/g, '').toLowerCase();
    filterParts.push(`loanSystemId eq ${cleanLoanId}`);
  }

  if (searchParams?.status) {
    filterParts.push(`status eq '${searchParams.status}'`);
  }

  if (searchParams?.fromDate) {
    filterParts.push(`paymentDate ge ${searchParams.fromDate}`);
  }

  if (searchParams?.toDate) {
    filterParts.push(`paymentDate le ${searchParams.toDate}`);
  }

  const parts: string[] = [];
  parts.push(`$filter=${encodeURIComponent(filterParts.join(' and '))}`);
  parts.push(`$top=${searchParams?.top ?? 100}`);

  if (searchParams?.skip) {
    parts.push(`$skip=${searchParams.skip}`);
  }

  if (searchParams?.sort) {
    const [field, order] = searchParams.sort.split('_');
    if (field && order) parts.push(`$orderby=${encodeURIComponent(`${field} ${order}`)}`);
  } else {
    parts.push(`$orderby=emiNumber%20asc`);
  }

  parts.push(`$count=true`);

  const queryString = `?${parts.join('&')}`;
  const fullEndpoint = `/api/alletec/moneyTracker/v1.0${LOAN_PAYMENTS_ENDPOINT}${queryString}`;

  const response = await bcFetch(fullEndpoint);

  return {
    value: (response.value || []).map(mapBCLoanPaymentToLoanPayment),
    '@odata.count': response['@odata.count'] ?? (response.value || []).length,
    '@odata.nextLink': response['@odata.nextLink'],
  };
}

export async function getLoanPayment(
  systemId: string,
  ownerEntraObjectId: string
): Promise<LoanPayment | null> {
  const endpoint = `/api/alletec/moneyTracker/v1.0${LOAN_PAYMENTS_ENDPOINT}(${systemId})`;
  
  try {
    const response = await bcFetch(endpoint);
    const dto = response as BCLoanPaymentResponseDTO;

    const cleanReqOid = ownerEntraObjectId.replace(/[{}]/g, '').toLowerCase();
    const cleanResOid = (dto.ownerEntraObjectId || '').replace(/[{}]/g, '').toLowerCase();
    if (cleanReqOid !== cleanResOid) {
      return null;
    }

    return mapBCLoanPaymentToLoanPayment(dto);
  } catch (error: any) {
    if (error.statusCode === 404) return null;
    throw error;
  }
}

export async function createLoanPayment(data: BCLoanPaymentCreateDTO): Promise<LoanPayment> {
  // Pre-flight check: Unique EMINumber for the loan
  const existingPayments = await getLoanPayments(data.ownerEntraObjectId, { loanSystemId: data.loanSystemId });
  const duplicate = existingPayments.value.find(p => p.emiNumber === data.emiNumber);
  
  if (duplicate) {
    throw new Error('A payment record for this EMI number already exists.');
  }

  const endpoint = `/api/alletec/moneyTracker/v1.0${LOAN_PAYMENTS_ENDPOINT}`;
  const response = await bcFetch(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });

  return mapBCLoanPaymentToLoanPayment(response as BCLoanPaymentResponseDTO);
}

export async function updateLoanPayment(
  systemId: string,
  ownerEntraObjectId: string,
  data: BCLoanPaymentUpdateDTO,
  etag: string
): Promise<LoanPayment> {
  const existingPayment = await getLoanPayment(systemId, ownerEntraObjectId);
  if (!existingPayment) {
    throw new Error('Loan Payment not found or access denied.');
  }

  // Pre-flight check for unique EMINumber if it changed
  if (data.emiNumber && data.emiNumber !== existingPayment.emiNumber) {
    const allPayments = await getLoanPayments(ownerEntraObjectId, { loanSystemId: existingPayment.loanSystemId });
    const duplicate = allPayments.value.find(p => p.systemId !== systemId && p.emiNumber === data.emiNumber);
    if (duplicate) {
      throw new Error('Another payment record with this EMI number already exists.');
    }
  }

  const endpoint = `/api/alletec/moneyTracker/v1.0${LOAN_PAYMENTS_ENDPOINT}(${systemId})`;
  const response = await bcFetch(endpoint, {
    method: 'PATCH',
    headers: {
      'If-Match': etag,
    },
    body: JSON.stringify(data),
  });

  return mapBCLoanPaymentToLoanPayment(response as BCLoanPaymentResponseDTO);
}

export async function deleteLoanPayment(
  systemId: string,
  ownerEntraObjectId: string,
  etag: string
): Promise<void> {
  const existingPayment = await getLoanPayment(systemId, ownerEntraObjectId);
  if (!existingPayment) {
    throw new Error('Loan Payment not found or access denied.');
  }

  const endpoint = `/api/alletec/moneyTracker/v1.0${LOAN_PAYMENTS_ENDPOINT}(${systemId})`;
  await bcFetch(endpoint, {
    method: 'DELETE',
    headers: {
      'If-Match': etag,
    },
  });
}
