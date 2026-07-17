"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Investment, InvestmentType, InvestmentStatus } from '@/types/investment.types';
import { InvestmentSchema, InvestmentFormData } from '@/schemas/investment.schema';
import { createInvestmentAction, updateInvestmentAction } from '@/actions/investment.actions';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface InvestmentFormProps {
  investment?: Investment;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function InvestmentForm({ investment, onSuccess, onCancel }: InvestmentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(InvestmentSchema),
    defaultValues: investment ? {
      name: investment.name,
      type: investment.type,
      investedAmount: investment.investedAmount,
      currentValue: investment.currentValue,
      status: investment.status,
      notes: investment.notes || '',
    } : {
      name: '',
      type: 'MutualFund',
      investedAmount: 0,
      currentValue: 0,
      status: 'Active',
      notes: '',
    },
  });

  const typeValue = watch('type');
  const statusValue = watch('status');

  const onSubmit = async (formData: any) => {
    const data = formData as InvestmentFormData;
    setIsSubmitting(true);

    try {
      if (investment) {
        // Update
        const res = await updateInvestmentAction(
          investment.systemId,
          {
            name: data.name,
            type: data.type,
            investedAmount: data.investedAmount,
            currentValue: data.currentValue,
            status: data.status,
            notes: data.notes || '',
          },
          investment.etag
        );

        if (res.success) {
          toast.success('Investment updated successfully');
          onSuccess?.();
          router.refresh();
        } else {
          toast.error(res.error || 'Failed to update investment');
        }
      } else {
        // Create
        const res = await createInvestmentAction({
          ownerEntraObjectId: '', // Will be injected by Server Action
          name: data.name,
          type: data.type,
          investedAmount: data.investedAmount,
          currentValue: data.currentValue,
          status: data.status,
          notes: data.notes || '',
        });

        if (res.success) {
          toast.success('Investment created successfully');
          onSuccess?.();
          router.refresh();
        } else {
          toast.error(res.error || 'Failed to create investment');
        }
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" placeholder="e.g. HDFC Nifty 50 Index Fund" {...register('name')} />
        {errors.name && <p className="text-xs text-rose-500">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Type</Label>
          <Select onValueChange={(val) => setValue('type', val as InvestmentType)} value={typeValue}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="FixedDeposit">Fixed Deposit</SelectItem>
                <SelectItem value="RecurringDeposit">Recurring Deposit</SelectItem>
                <SelectItem value="SIP">SIP</SelectItem>
                <SelectItem value="MutualFund">Mutual Fund</SelectItem>
                <SelectItem value="Stock">Stock</SelectItem>
                <SelectItem value="Gold">Gold</SelectItem>
                <SelectItem value="Crypto">Crypto</SelectItem>
                <SelectItem value="Custom">Custom</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          {errors.type && <p className="text-xs text-rose-500">{errors.type.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Select onValueChange={(val) => setValue('status', val as InvestmentStatus)} value={statusValue}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Matured">Matured</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
                <SelectItem value="Sold">Sold</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          {errors.status && <p className="text-xs text-rose-500">{errors.status.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="investedAmount">Invested Amount</Label>
          <Input id="investedAmount" type="number" step="0.01" {...register('investedAmount')} />
          {errors.investedAmount && <p className="text-xs text-rose-500">{errors.investedAmount.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="currentValue">Current Value</Label>
          <Input id="currentValue" type="number" step="0.01" {...register('currentValue')} />
          {errors.currentValue && <p className="text-xs text-rose-500">{errors.currentValue.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea id="notes" placeholder="Any additional details..." {...register('notes')} />
        {errors.notes && <p className="text-xs text-rose-500">{errors.notes.message}</p>}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {investment ? 'Update' : 'Create'} Investment
        </Button>
      </div>
    </form>
  );
}
