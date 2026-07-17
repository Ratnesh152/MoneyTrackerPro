"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { GoalForm } from './GoalForm';
import { SavingsGoal, BCSavingsGoalCreateDTO, BCSavingsGoalUpdateDTO } from '@/types/goal.types';
import { SavingsGoalFormData } from '@/schemas/goal.schema';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface GoalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: SavingsGoal;
  ownerEntraObjectId: string;
  createAction?: (dto: BCSavingsGoalCreateDTO) => Promise<{ success: boolean; error?: string }>;
  updateAction?: (systemId: string, dto: BCSavingsGoalUpdateDTO, etag: string) => Promise<{ success: boolean; error?: string }>;
}

export function GoalDialog({
  isOpen,
  onClose,
  initialData,
  ownerEntraObjectId,
  createAction,
  updateAction,
}: GoalDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (data: SavingsGoalFormData) => {
    setIsLoading(true);

    try {
      if (initialData && updateAction) {
        // Update
        const dto: BCSavingsGoalUpdateDTO = {
          goalName: data.goalName,
          goalType: data.goalType,
          targetAmount: data.targetAmount,
          openingSavedAmount: data.openingSavedAmount,
          targetDate: data.targetDate || undefined,
          monthlyContribution: data.monthlyContribution,
          autoContribute: data.autoContribute,
          status: data.status,
          notes: data.notes || undefined,
        };

        const res = await updateAction(initialData.systemId, dto, initialData.etag);
        if (res.error) throw new Error(res.error);
        toast.success('Goal updated successfully');

      } else if (createAction) {
        // Create
        const dto: BCSavingsGoalCreateDTO = {
          ownerEntraObjectId,
          goalName: data.goalName,
          goalType: data.goalType,
          targetAmount: data.targetAmount,
          openingSavedAmount: data.openingSavedAmount,
          targetDate: data.targetDate || undefined,
          monthlyContribution: data.monthlyContribution,
          autoContribute: data.autoContribute,
          status: data.status,
          notes: data.notes || undefined,
        };

        const res = await createAction(dto);
        if (res.error) throw new Error(res.error);
        toast.success('Goal created successfully');
      }

      router.refresh();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Savings Goal' : 'Create Savings Goal'}</DialogTitle>
          <DialogDescription>
            {initialData ? 'Update the details for your savings goal.' : 'Set a new target and track your savings.'}
          </DialogDescription>
        </DialogHeader>

        <GoalForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
