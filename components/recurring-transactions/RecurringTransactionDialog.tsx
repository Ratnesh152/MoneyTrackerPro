"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RecurringTransactionForm } from './RecurringTransactionForm';
import { RecurringTransaction, BCRecurringTransactionCreateDTO, BCRecurringTransactionUpdateDTO } from '@/types/recurring-transaction.types';
import { RecurringTransactionFormData } from '@/schemas/recurring-transaction.schema';
import { Account } from '@/types/account.types';
import { Category } from '@/types/category.types';
import { toast } from 'sonner';

interface RecurringTransactionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: RecurringTransaction;
  accounts: Account[];
  categories: Category[];
  createAction: (dto: BCRecurringTransactionCreateDTO) => Promise<{ success: boolean; error?: string }>;
  updateAction: (systemId: string, dto: BCRecurringTransactionUpdateDTO, etag: string) => Promise<{ success: boolean; error?: string }>;
  ownerEntraObjectId: string;
}

export function RecurringTransactionDialog({
  isOpen,
  onClose,
  initialData,
  accounts,
  categories,
  createAction,
  updateAction,
  ownerEntraObjectId
}: RecurringTransactionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: RecurringTransactionFormData) => {
    setIsLoading(true);
    try {
      const selectedAccount = accounts.find(a => a.systemId === data.accountId);
      const selectedCategory = categories.find(c => c.systemId === data.categoryId);

      if (initialData) {
        const dto: BCRecurringTransactionUpdateDTO = {
          ...data,
          endDate: data.endDate || undefined,
          notes: data.notes || undefined,
          accountCode: selectedAccount?.name || '',
          categoryCode: selectedCategory?.code || '',
        };
        
        const res = await updateAction(initialData.systemId, dto, initialData.etag);
        if (res.error) throw new Error(res.error);
        toast.success('Recurring transaction updated');
      } else {
        const dto: BCRecurringTransactionCreateDTO = {
          ...data,
          ownerEntraObjectId,
          accountCode: selectedAccount?.name || '',
          categoryCode: selectedCategory?.code || '',
          endDate: data.endDate || undefined,
          notes: data.notes || undefined,
        };

        const res = await createAction(dto);
        if (res.error) throw new Error(res.error);
        toast.success('Recurring transaction created');
      }

      onClose();
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Edit Recurring Transaction' : 'New Recurring Transaction'}
          </DialogTitle>
        </DialogHeader>
        
        <RecurringTransactionForm
          initialData={initialData}
          accounts={accounts}
          categories={categories}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
