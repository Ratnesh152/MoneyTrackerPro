"use server";

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import {
  createRecurringTransaction,
  updateRecurringTransaction,
  deleteRecurringTransaction,
} from '@/services/business-central/recurring-transaction.service';
import {
  BCRecurringTransactionCreateDTO,
  BCRecurringTransactionUpdateDTO,
} from '@/types/recurring-transaction.types';

export async function createRecurringAction(dto: BCRecurringTransactionCreateDTO) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');
    
    // Ensure the DTO matches the user's ID to prevent IDOR
    if (dto.ownerEntraObjectId !== session.user.id) {
      throw new Error('Unauthorized');
    }

    await createRecurringTransaction(dto);
    revalidatePath('/recurring-transactions');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create recurring transaction' };
  }
}

export async function updateRecurringAction(systemId: string, dto: BCRecurringTransactionUpdateDTO, etag: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

    await updateRecurringTransaction(systemId, session.user.id, dto, etag);
    revalidatePath('/recurring-transactions');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update recurring transaction' };
  }
}

export async function deleteRecurringAction(systemId: string, etag: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

    await deleteRecurringTransaction(systemId, session.user.id, etag);
    revalidatePath('/recurring-transactions');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete recurring transaction' };
  }
}

export async function runEngineAction() {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

    // Trigger the backend cron job directly, passing the user's ID
    const url = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const cronSecret = process.env.CRON_SECRET || '';
    
    const response = await fetch(`${url}/api/cron/process-recurring?ownerId=${session.user.id}`, {
      headers: {
        ...(cronSecret ? { 'Authorization': `Bearer ${cronSecret}` } : {})
      }
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to run engine');
    }

    revalidatePath('/recurring-transactions');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to run recurring engine' };
  }
}
