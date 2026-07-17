import React from 'react';
import { savingsGoalService } from '@/services/business-central/goal.service';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { GoalTable } from '@/components/features/goals/GoalTable';
import { BCSavingsGoalCreateDTO, BCSavingsGoalUpdateDTO } from '@/types/goal.types';
import { revalidatePath } from 'next/cache';

export default async function GoalsPage() {
  const session = await auth();
  if (!session?.user?.id || !session?.accessToken) {
    redirect('/login');
  }

  const goals = await savingsGoalService.getSavingsGoalsByOwner(session.user.id, session.accessToken);

  async function createGoal(dto: BCSavingsGoalCreateDTO) {
    'use server';
    const s = await auth();
    if (!s?.accessToken) return { success: false, error: 'Unauthorized' };
    const res = await savingsGoalService.createSavingsGoal(dto, s.accessToken);
    if (res.success) revalidatePath('/goals');
    return res;
  }

  async function updateGoal(systemId: string, dto: BCSavingsGoalUpdateDTO, etag: string) {
    'use server';
    const s = await auth();
    if (!s?.accessToken) return { success: false, error: 'Unauthorized' };
    const res = await savingsGoalService.updateSavingsGoal(systemId, dto, etag, s.accessToken);
    if (res.success) revalidatePath('/goals');
    return res;
  }

  async function deleteGoal(systemId: string, etag: string) {
    'use server';
    const s = await auth();
    if (!s?.accessToken) return { success: false, error: 'Unauthorized' };
    const res = await savingsGoalService.deleteSavingsGoal(systemId, etag, s.accessToken);
    if (res.success) revalidatePath('/goals');
    return res;
  }

  return (
    <div className="container mx-auto py-10 max-w-7xl">
      <GoalTable
        goals={goals}
        ownerEntraObjectId={session.user.id}
        createAction={createGoal}
        updateAction={updateGoal}
        deleteAction={deleteGoal}
      />
    </div>
  );
}
