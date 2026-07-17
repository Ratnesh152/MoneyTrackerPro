"use client";

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SavingsGoalSchema, SavingsGoalFormData } from '@/schemas/goal.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SavingsGoal, SavingsGoalType, SavingsGoalStatus } from '@/types/goal.types';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

interface GoalFormProps {
  initialData?: SavingsGoal;
  onSubmit: (data: SavingsGoalFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function GoalForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading
}: GoalFormProps) {
  
  const { register, handleSubmit, control, formState: { errors } } = useForm<any>({
    resolver: zodResolver(SavingsGoalSchema),
    defaultValues: {
      goalName: initialData?.goalName || '',
      goalType: initialData?.goalType || 'EmergencyFund',
      targetAmount: initialData?.targetAmount || 0,
      openingSavedAmount: initialData?.openingSavedAmount || 0,
      targetDate: initialData?.targetDate || '',
      monthlyContribution: initialData?.monthlyContribution || 0,
      autoContribute: initialData ? initialData.autoContribute : false,
      status: initialData?.status || 'Active',
      notes: initialData?.notes || ''
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Goal Name</label>
          <Input placeholder="e.g. Dream House" {...register('goalName')} />
          {errors.goalName && <p className="text-sm text-destructive">{errors.goalName.message as string}</p>}
        </div>

        {/* Goal Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Goal Type</label>
          <Controller
            control={control}
            name="goalType"
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EmergencyFund">Emergency Fund</SelectItem>
                  <SelectItem value="Vacation">Vacation</SelectItem>
                  <SelectItem value="Car">Car</SelectItem>
                  <SelectItem value="House">House</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                  <SelectItem value="Retirement">Retirement</SelectItem>
                  <SelectItem value="Wedding">Wedding</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.goalType && <p className="text-sm text-destructive">{errors.goalType.message as string}</p>}
        </div>

        {/* Target Amount */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Target Amount</label>
          <Input type="number" step="0.01" {...register('targetAmount')} />
          {errors.targetAmount && <p className="text-sm text-destructive">{errors.targetAmount.message as string}</p>}
        </div>

        {/* Opening Saved Amount */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Opening Saved Amount</label>
          <Input type="number" step="0.01" {...register('openingSavedAmount')} />
          {errors.openingSavedAmount && <p className="text-sm text-destructive">{errors.openingSavedAmount.message as string}</p>}
        </div>

        {/* Target Date */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Target Date</label>
          <Input type="date" {...register('targetDate')} />
          {errors.targetDate && <p className="text-sm text-destructive">{errors.targetDate.message as string}</p>}
        </div>

        {/* Monthly Contribution */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Target Monthly Contribution</label>
          <Input type="number" step="0.01" {...register('monthlyContribution')} />
          {errors.monthlyContribution && <p className="text-sm text-destructive">{errors.monthlyContribution.message as string}</p>}
        </div>

        {/* Auto Contribute */}
        <div className="space-y-2 flex flex-col justify-center">
          <div className="flex items-center space-x-2">
            <Controller
              control={control}
              name="autoContribute"
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <label className="text-sm font-medium">Auto-Contribute (Future Use)</label>
          </div>
          {errors.autoContribute && <p className="text-sm text-destructive">{errors.autoContribute.message as string}</p>}
        </div>

        {/* Status */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Paused">Paused</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.status && <p className="text-sm text-destructive">{errors.status.message as string}</p>}
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Notes</label>
        <Textarea placeholder="Optional notes" {...register('notes')} />
        {errors.notes && <p className="text-sm text-destructive">{errors.notes.message as string}</p>}
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" type="button" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Goal"}
        </Button>
      </div>
    </form>
  );
}
