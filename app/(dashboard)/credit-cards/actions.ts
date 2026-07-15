'use server';

import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { 
  createCreditCard, 
  updateCreditCard, 
  deleteCreditCard 
} from '@/services/business-central/credit-card.service';
import { BCreditCardCreateDTO, BCreditCardUpdateDTO } from '@/types/credit-card.types';

export async function createCreditCardAction(data: Omit<BCreditCardCreateDTO, 'ownerEntraObjectId'>) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  try {
    const createData: BCreditCardCreateDTO = {
      ...data,
      ownerEntraObjectId: session.user.id,
    };
    
    await createCreditCard(createData);
    revalidatePath('/credit-cards');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create credit card' };
  }
}

export async function updateCreditCardAction(systemId: string, etag: string, data: BCreditCardUpdateDTO) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  try {
    await updateCreditCard(systemId, session.user.id, data, etag);
    revalidatePath('/credit-cards');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update credit card' };
  }
}

export async function deleteCreditCardAction(systemId: string, etag: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  try {
    await deleteCreditCard(systemId, session.user.id, etag);
    revalidatePath('/credit-cards');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete credit card' };
  }
}
