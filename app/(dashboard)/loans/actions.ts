'use server';

import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { 
  createLoan, 
  updateLoan, 
  deleteLoan 
} from '@/services/business-central/loan.service';
import { BCLoanCreateDTO, BCLoanUpdateDTO } from '@/types/loan.types';

export async function createLoanAction(data: Omit<BCLoanCreateDTO, 'ownerEntraObjectId'>) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  try {
    const createData: BCLoanCreateDTO = {
      ...data,
      ownerEntraObjectId: session.user.id,
    };
    
    await createLoan(createData);
    revalidatePath('/loans');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create loan' };
  }
}

export async function updateLoanAction(systemId: string, etag: string, data: BCLoanUpdateDTO) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  try {
    await updateLoan(systemId, session.user.id, data, etag);
    revalidatePath('/loans');
    revalidatePath(`/loans/${systemId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update loan' };
  }
}

export async function deleteLoanAction(systemId: string, etag: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  try {
    await deleteLoan(systemId, session.user.id, etag);
    revalidatePath('/loans');
    revalidatePath(`/loans/${systemId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete loan' };
  }
}

import { 
  createLoanPayment, 
  updateLoanPayment 
} from '@/services/business-central/loan-payment.service';
import { BCLoanPaymentCreateDTO, BCLoanPaymentUpdateDTO } from '@/types/loan-payment.types';

export async function recordLoanPaymentAction(data: Omit<BCLoanPaymentCreateDTO, 'ownerEntraObjectId'>) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  try {
    const createData: BCLoanPaymentCreateDTO = {
      ...data,
      ownerEntraObjectId: session.user.id,
    };
    
    await createLoanPayment(createData);
    
    // Auto-closure logic
    const { getLoan } = await import('@/services/business-central/loan.service');
    const { getLoanPayments } = await import('@/services/business-central/loan-payment.service');
    const { calculateLoanPaymentAnalytics } = await import('@/services/loan-payment-analytics.service');
    const { calculateLoanAnalytics } = await import('@/services/loan-analytics.service');
    
    const [loan, payments] = await Promise.all([
      getLoan(data.loanSystemId, session.user.id),
      getLoanPayments(session.user.id, { loanSystemId: data.loanSystemId })
    ]);
    
    if (loan) {
      const baseAnalytics = calculateLoanAnalytics(loan);
      const analytics = calculateLoanPaymentAnalytics(baseAnalytics, payments.value);
      if (analytics.outstandingPrincipal <= 0 && loan.status !== 'Closed') {
        await updateLoan(data.loanSystemId, session.user.id, { status: 'Closed' }, loan.etag!);
      }
    }
    
    revalidatePath(`/loans/${data.loanSystemId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to record payment' };
  }
}

export async function updateLoanPaymentAction(systemId: string, loanSystemId: string, etag: string, data: BCLoanPaymentUpdateDTO) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  try {
    await updateLoanPayment(systemId, session.user.id, data, etag);
    
    // Auto-closure logic
    const { getLoan } = await import('@/services/business-central/loan.service');
    const { getLoanPayments } = await import('@/services/business-central/loan-payment.service');
    const { calculateLoanPaymentAnalytics } = await import('@/services/loan-payment-analytics.service');
    const { calculateLoanAnalytics } = await import('@/services/loan-analytics.service');
    
    const [loan, payments] = await Promise.all([
      getLoan(loanSystemId, session.user.id),
      getLoanPayments(session.user.id, { loanSystemId })
    ]);
    
    if (loan) {
      const baseAnalytics = calculateLoanAnalytics(loan);
      const analytics = calculateLoanPaymentAnalytics(baseAnalytics, payments.value);
      if (analytics.outstandingPrincipal <= 0 && loan.status !== 'Closed') {
        await updateLoan(loanSystemId, session.user.id, { status: 'Closed' }, loan.etag!);
      }
    }
    
    revalidatePath(`/loans/${loanSystemId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update payment' };
  }
}
