'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { budgetSchema } from '@/schemas/budget.schema';
import {
  createBudget,
  updateBudget,
  deleteBudget,
} from '@/services/business-central/budget.service';
import { BCBudgetCreateDTO, BCBudgetUpdateDTO } from '@/types/budget.types';

export async function createBudgetAction(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized: No active session' };
    }

    const rawData = {
      categoryId: formData.get('categoryId'),
      budgetMonth: formData.get('budgetMonth'),
      budgetYear: formData.get('budgetYear'),
      budgetAmount: formData.get('budgetAmount'),
      notes: formData.get('notes') || '',
    };

    const validatedData = budgetSchema.safeParse(rawData);
    if (!validatedData.success) {
      return {
        success: false,
        error: 'Validation failed: ' + validatedData.error.issues.map(i => i.message).join(', '),
      };
    }

    const dto: BCBudgetCreateDTO = {
      ownerEntraObjectId: session.user.id,
      categoryId: validatedData.data.categoryId,
      budgetMonth: validatedData.data.budgetMonth,
      budgetYear: validatedData.data.budgetYear,
      budgetAmount: validatedData.data.budgetAmount,
      notes: validatedData.data.notes || '',
    };

    await createBudget(dto);
    
    revalidatePath('/budgets');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: unknown) {
    console.error('Failed to create budget:', error);
    const err = error as Error;
    return { success: false, error: err.message || 'Failed to create budget' };
  }
}

export async function updateBudgetAction(systemId: string, etag: string, formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized: No active session' };
    }

    // Only budgetAmount and notes are updatable as per BCBudgetUpdateDTO
    const rawData = {
      budgetAmount: formData.get('budgetAmount'),
      notes: formData.get('notes') || '',
    };

    // We can use a partial schema or just validate specific fields
    const amountParse = parseInt(rawData.budgetAmount as string, 10);
    if (isNaN(amountParse) || amountParse < 0) {
      return { success: false, error: 'Budget amount must be a valid positive number' };
    }

    const dto: BCBudgetUpdateDTO = {
      budgetAmount: amountParse,
      notes: rawData.notes as string,
    };

    await updateBudget(systemId, session.user.id, dto, etag);

    revalidatePath('/budgets');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: unknown) {
    console.error('Failed to update budget:', error);
    const err = error as Error;
    return { success: false, error: err.message || 'Failed to update budget' };
  }
}

export async function deleteBudgetAction(systemId: string, etag: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized: No active session' };
    }

    await deleteBudget(systemId, session.user.id, etag);

    revalidatePath('/budgets');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: unknown) {
    console.error('Failed to delete budget:', error);
    const err = error as Error;
    return { success: false, error: err.message || 'Failed to delete budget' };
  }
}
