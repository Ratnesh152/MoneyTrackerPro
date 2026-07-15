'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { accountSchema } from '@/schemas/account.schema';
import {
  createAccount as bcCreateAccount,
  updateAccount as bcUpdateAccount,
  deleteAccount as bcDeleteAccount,
} from '@/services/business-central/account.service';

export async function createAccountAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  const rawData = {
    name: formData.get('name'),
    accountType: formData.get('accountType'),
    openingBalance: formData.get('openingBalance'),
    currencyCode: formData.get('currencyCode'),
    isDefault: formData.get('isDefault') === 'true',
    notes: formData.get('notes'),
  };

  const validatedFields = accountSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      success: false,
      error: 'Invalid form data',
      details: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const newAccount = await bcCreateAccount({
      ownerEntraObjectId: session.user.id,
      ...validatedFields.data,
      currencyCode: validatedFields.data.currencyCode || undefined,
      notes: validatedFields.data.notes || undefined,
    });

    revalidatePath('/accounts');
    return { success: true, data: newAccount };
  } catch (error) {
    const err = error as Error;
    console.error('Failed to create account:', err);
    return {
      success: false,
      error: err.message || 'Failed to create account. Please try again.',
    };
  }
}

export async function updateAccountAction(systemId: string, etag: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  const rawData = {
    name: formData.get('name'),
    accountType: formData.get('accountType'),
    openingBalance: formData.get('openingBalance'),
    currencyCode: formData.get('currencyCode'),
    isDefault: formData.get('isDefault') === 'true',
    notes: formData.get('notes'),
  };

  const validatedFields = accountSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      success: false,
      error: 'Invalid form data',
      details: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const updatedAccount = await bcUpdateAccount(
      systemId,
      session.user.id,
      {
        ...validatedFields.data,
        currencyCode: validatedFields.data.currencyCode || undefined,
        notes: validatedFields.data.notes || undefined,
      },
      etag
    );

    revalidatePath('/accounts');
    return { success: true, data: updatedAccount };
  } catch (error) {
    const err = error as Error;
    console.error('Failed to update account:', err);
    if (err.message?.includes('etag')) {
       return { success: false, error: 'Concurrency conflict: This account was modified by another process. Please refresh and try again.' };
    }
    return {
      success: false,
      error: err.message || 'Failed to update account. Please try again.',
    };
  }
}

export async function deleteAccountAction(systemId: string, etag: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await bcDeleteAccount(systemId, session.user.id, etag);
    revalidatePath('/accounts');
    return { success: true };
  } catch (error) {
    const err = error as Error;
    console.error('Failed to delete account:', err);
    return {
      success: false,
      error: err.message || 'Failed to delete account. Please try again.',
    };
  }
}
