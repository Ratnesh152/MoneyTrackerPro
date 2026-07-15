"use server";

import { revalidatePath } from 'next/cache';
import { transactionService } from '@/services/business-central/transaction.service';
import { getAccountById } from '@/services/business-central/account.service';
import { getCategoryById } from '@/services/business-central/category.service';
import { auth } from '@/auth';
import { browserTransactionInputSchema } from '@/schemas/transaction.schema';
import { ZodError } from 'zod';
import { BCTransactionCreateDTO, BCTransactionUpdateDTO } from '@/types/transaction.types';

export type ActionState<T = unknown> = {
  status: 'idle' | 'success' | 'error';
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
};

export async function createTransactionAction(
  prevState: ActionState | null,
  formData: FormData | Record<string, unknown>
): Promise<ActionState> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { status: 'error', message: 'Unauthorized. Please log in.' };
    }
    const ownerEntraObjectId = session.user.id;

    const isFormData = formData instanceof FormData;
    const rawData = isFormData ? Object.fromEntries(formData.entries()) : formData as Record<string, unknown>;
    
    if (typeof rawData.amount === 'string') {
      rawData.amount = parseFloat(rawData.amount);
    }

    const validatedData = browserTransactionInputSchema.parse(rawData);

    // Relational Validation
    const account = await getAccountById(validatedData.accountId, ownerEntraObjectId);
    if (!account) {
      return { status: 'error', message: 'Validation failed', errors: { accountId: ['Selected account does not exist or access is denied.'] } };
    }

    const category = await getCategoryById(validatedData.categoryId, ownerEntraObjectId);
    if (!category) {
      return { status: 'error', message: 'Validation failed', errors: { categoryId: ['Selected category does not exist or access is denied.'] } };
    }
    if (!category.isActive) {
      return { status: 'error', message: 'Validation failed', errors: { categoryId: ['Selected category is inactive.'] } };
    }

    // Populate Codes securely on the server
    const createDto: Omit<BCTransactionCreateDTO, 'ownerEntraObjectId'> = {
      transactionDate: validatedData.transactionDate,
      transactionType: validatedData.transactionType,
      description: validatedData.description,
      categoryId: validatedData.categoryId,
      accountId: validatedData.accountId,
      amount: validatedData.amount,
      subcategoryCode: validatedData.subcategoryCode || '',
      currencyCode: validatedData.currencyCode || '',
      paymentMethodCode: validatedData.paymentMethodCode || '',
      reference: validatedData.reference || '',
      notes: validatedData.notes || '',
      tags: validatedData.tags || '',
      accountCode: account.name,
      categoryCode: category.code,
    };

    const transaction = await transactionService.createTransaction(ownerEntraObjectId, createDto);

    revalidatePath('/transactions');
    return { status: 'success', message: 'Transaction created successfully.', data: transaction };
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return { status: 'error', message: 'Validation failed', errors: error.flatten().fieldErrors };
    }
    const err = error as Error;
    return { status: 'error', message: err?.message || 'An unexpected error occurred.' };
  }
}

export async function updateTransactionAction(
  systemId: string,
  etag: string,
  payload: Record<string, unknown>
): Promise<ActionState> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { status: 'error', message: 'Unauthorized. Please log in.' };
    }
    const ownerEntraObjectId = session.user.id;

    if (typeof payload.amount === 'string') {
      payload.amount = parseFloat(payload.amount);
    }

    const validatedData = browserTransactionInputSchema.partial().parse(payload);
    
    const updateDto: BCTransactionUpdateDTO = {
      ...validatedData,
      subcategoryCode: validatedData.subcategoryCode || undefined,
      currencyCode: validatedData.currencyCode || undefined,
      paymentMethodCode: validatedData.paymentMethodCode || undefined,
      reference: validatedData.reference || undefined,
      notes: validatedData.notes || undefined,
      tags: validatedData.tags || undefined,
    };

    // Relational Validation for Updates
    if (validatedData.accountId) {
      const account = await getAccountById(validatedData.accountId, ownerEntraObjectId);
      if (!account) return { status: 'error', message: 'Validation failed', errors: { accountId: ['Selected account does not exist.'] } };
      updateDto.accountCode = account.name;
    }

    if (validatedData.categoryId) {
      const category = await getCategoryById(validatedData.categoryId, ownerEntraObjectId);
      if (!category) return { status: 'error', message: 'Validation failed', errors: { categoryId: ['Selected category does not exist.'] } };
      if (!category.isActive) return { status: 'error', message: 'Validation failed', errors: { categoryId: ['Selected category is inactive.'] } };
      updateDto.categoryCode = category.code;
    }

    const transaction = await transactionService.updateTransaction(
      ownerEntraObjectId,
      systemId,
      etag,
      updateDto
    );

    revalidatePath('/transactions');
    return { status: 'success', message: 'Transaction updated successfully.', data: transaction };
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return { status: 'error', message: 'Validation failed', errors: error.flatten().fieldErrors };
    }
    const err = error as Error;
    if (err?.name === 'ConcurrencyConflictError') {
      return { status: 'error', message: 'The transaction was modified by someone else. Please refresh and try again.' };
    }

    return { status: 'error', message: err?.message || 'An unexpected error occurred.' };
  }
}

export async function deleteTransactionAction(
  systemId: string,
  etag: string
): Promise<ActionState> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { status: 'error', message: 'Unauthorized. Please log in.' };
    }
    const ownerEntraObjectId = session.user.id;

    await transactionService.deleteTransaction(ownerEntraObjectId, systemId, etag);

    revalidatePath('/transactions');
    return { status: 'success', message: 'Transaction deleted successfully.' };
  } catch (error: unknown) {
    const err = error as Error;
    if (err?.name === 'ConcurrencyConflictError') {
      return { status: 'error', message: 'The transaction was modified by someone else. Please refresh and try again.' };
    }
    return { status: 'error', message: err?.message || 'Failed to delete transaction.' };
  }
}
