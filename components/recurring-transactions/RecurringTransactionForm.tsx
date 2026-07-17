"use client";

import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RecurringTransactionSchema, RecurringTransactionFormData } from '@/schemas/recurring-transaction.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RecurringSchedulePreview } from './RecurringSchedulePreview';
import { RecurringTransaction, RecurringFrequency } from '@/types/recurring-transaction.types';
import { Account } from '@/types/account.types';
import { Category } from '@/types/category.types';

interface RecurringTransactionFormProps {
  initialData?: RecurringTransaction;
  accounts: Account[];
  categories: Category[];
  onSubmit: (data: RecurringTransactionFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function RecurringTransactionForm({
  initialData,
  accounts,
  categories,
  onSubmit,
  onCancel,
  isLoading
}: RecurringTransactionFormProps) {
  
  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<any>({
    resolver: zodResolver(RecurringTransactionSchema),
    defaultValues: {
      name: initialData?.name || '',
      transactionType: initialData?.transactionType || 'Expense',
      accountId: initialData?.accountId || '',
      categoryId: initialData?.categoryId || '',
      amount: initialData?.amount || 0,
      startDate: initialData?.startDate || new Date().toISOString().split('T')[0],
      endDate: initialData?.endDate || '',
      frequency: initialData?.frequency || 'Monthly',
      interval: initialData?.interval || 1,
      nextRunDate: initialData?.nextRunDate || new Date().toISOString().split('T')[0],
      autoGenerate: initialData ? initialData.autoGenerate : true,
      active: initialData ? initialData.active : true,
      notes: initialData?.notes || ''
    }
  });

  const [previewValues, setPreviewValues] = useState<Partial<RecurringTransactionFormData>>({
    frequency: initialData?.frequency || 'Monthly',
    interval: initialData?.interval || 1,
    amount: initialData?.amount || 0,
    startDate: initialData?.startDate || new Date().toISOString().split('T')[0],
    nextRunDate: initialData?.nextRunDate || new Date().toISOString().split('T')[0],
    endDate: initialData?.endDate || '',
  });

  useEffect(() => {
    const subscription = watch((value) => {
      setPreviewValues(value as Partial<RecurringTransactionFormData>);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const transactionType = watch('transactionType');
  const filteredCategories = categories.filter(c => 
    c.transactionType ? c.transactionType === transactionType : true // Handle potential schema mismatch gracefully
  );

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Name</label>
          <Input placeholder="e.g. Monthly Rent" {...register('name')} />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message as string}</p>}
        </div>

        {/* Transaction Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Type</label>
          <Controller
            control={control}
            name="transactionType"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Income">Income</SelectItem>
                  <SelectItem value="Expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.transactionType && <p className="text-sm text-destructive">{errors.transactionType.message as string}</p>}
        </div>

        {/* Account */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Account</label>
          <Controller
            control={control}
            name="accountId"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((acc) => (
                    <SelectItem key={acc.systemId} value={acc.systemId}>
                      {acc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.accountId && <p className="text-sm text-destructive">{errors.accountId.message as string}</p>}
        </div>

        {/* Category */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Category</label>
          <Controller
            control={control}
            name="categoryId"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((cat) => (
                    <SelectItem key={cat.systemId} value={cat.systemId}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.categoryId && <p className="text-sm text-destructive">{errors.categoryId.message as string}</p>}
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Amount</label>
          <Input type="number" step="0.01" {...register('amount')} />
          {errors.amount && <p className="text-sm text-destructive">{errors.amount.message as string}</p>}
        </div>

        {/* Frequency */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Frequency</label>
          <Controller
            control={control}
            name="frequency"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Daily">Daily</SelectItem>
                  <SelectItem value="Weekly">Weekly</SelectItem>
                  <SelectItem value="BiWeekly">BiWeekly</SelectItem>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                  <SelectItem value="Quarterly">Quarterly</SelectItem>
                  <SelectItem value="HalfYearly">Half Yearly</SelectItem>
                  <SelectItem value="Yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.frequency && <p className="text-sm text-destructive">{errors.frequency.message as string}</p>}
        </div>

        {/* Interval */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Interval (e.g. 1 = every {previewValues.frequency?.toLowerCase()})</label>
          <Input type="number" min={1} {...register('interval')} />
          {errors.interval && <p className="text-sm text-destructive">{errors.interval.message as string}</p>}
        </div>

        {/* Start Date */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Start Date</label>
          <Input type="date" {...register('startDate')} />
          {errors.startDate && <p className="text-sm text-destructive">{errors.startDate.message as string}</p>}
        </div>

        {/* End Date */}
        <div className="space-y-2">
          <label className="text-sm font-medium">End Date (Optional)</label>
          <Input type="date" {...register('endDate')} />
          {errors.endDate && <p className="text-sm text-destructive">{errors.endDate.message as string}</p>}
        </div>

        {/* Next Run Date */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Next Run Date</label>
          <Input type="date" {...register('nextRunDate')} />
          {errors.nextRunDate && <p className="text-sm text-destructive">{errors.nextRunDate.message as string}</p>}
        </div>
      </div>

      <RecurringSchedulePreview
        startDate={previewValues.nextRunDate || previewValues.startDate || new Date().toISOString().split('T')[0]}
        endDate={previewValues.endDate || undefined}
        frequency={(previewValues.frequency as RecurringFrequency) || 'Monthly'}
        interval={Number(previewValues.interval) || 1}
        amount={Number(previewValues.amount) || 0}
      />

      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" type="button" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Schedule"}
        </Button>
      </div>
    </form>
  );
}
