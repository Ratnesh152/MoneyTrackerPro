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
    revalidatePath(`/loans/${loanSystemId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update payment' };
  }
}
