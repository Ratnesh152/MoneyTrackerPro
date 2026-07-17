'use server';

import { auth } from '@/auth';
import { investmentService } from '@/services/business-central/investment.service';
import { BCInvestmentCreateDTO, BCInvestmentUpdateDTO } from '@/types/investment.types';
import { revalidatePath } from 'next/cache';

export async function createInvestmentAction(dto: BCInvestmentCreateDTO) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  // Ensure owner is the current user
  dto.ownerEntraObjectId = session.user.id;

  const res = await investmentService.createInvestment(dto);
  if (res.success) {
    revalidatePath('/dashboard');
    revalidatePath('/investments');
  }
  return res;
}

export async function updateInvestmentAction(systemId: string, dto: BCInvestmentUpdateDTO, etag: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  const res = await investmentService.updateInvestment(systemId, session.user.id, dto, etag);
  if (res.success) {
    revalidatePath('/dashboard');
    revalidatePath('/investments');
    revalidatePath(`/investments/${systemId}`);
  }
  return res;
}

export async function deleteInvestmentAction(systemId: string, etag: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  const res = await investmentService.deleteInvestment(systemId, session.user.id, etag);
  if (res.success) {
    revalidatePath('/dashboard');
    revalidatePath('/investments');
  }
  return res;
}
