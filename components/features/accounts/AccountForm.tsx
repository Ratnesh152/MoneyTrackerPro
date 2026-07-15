'use client';

import React, { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { accountSchema, AccountFormData } from '@/schemas/account.schema';
import { Account } from '@/types/account.types';
import { createAccountAction, updateAccountAction } from '@/app/(dashboard)/accounts/actions';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AccountFormProps {
  initialData?: Account;
  onSuccess?: () => void;
}

export function AccountForm({ initialData, onSuccess }: AccountFormProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema) as any,
    defaultValues: {
      name: initialData?.name || '',
      accountType: initialData?.accountType || 'Bank',
      openingBalance: initialData?.openingBalance || 0,
      currencyCode: initialData?.currencyCode || '',
      isDefault: initialData?.isDefault || false,
      notes: initialData?.notes || '',
    },
  });

  const accountType = useWatch({ control, name: 'accountType' });
  const isDefault = useWatch({ control, name: 'isDefault' });
  const [, startTransition] = useTransition();

  const onSubmit = async (data: AccountFormData) => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, value.toString());
          }
        });

        let result;
        if (initialData) {
          result = await updateAccountAction(initialData.systemId, initialData.etag, formData);
        } else {
          result = await createAccountAction(formData);
        }

        if (result.success) {
          toast.success(initialData ? 'Account updated' : 'Account created');
          router.refresh();
          onSuccess?.();
        } else {
          toast.error(result.error || 'Something went wrong');
        }
      } catch {
        toast.error('An unexpected error occurred');
      }
    });
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Account Name</Label>
        <Input 
          id="name"
          placeholder="e.g., Chase Checking" 
          {...register('name')} 
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="accountType">Account Type</Label>
          <Select 
            value={accountType} 
            onValueChange={(val) => {
              if (!val) return;
              setValue('accountType', val as 'Cash' | 'Bank' | 'Wallet', { shouldDirty: true });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Cash">Cash</SelectItem>
              <SelectItem value="Bank">Bank</SelectItem>
              <SelectItem value="Wallet">Wallet</SelectItem>
            </SelectContent>
          </Select>
          {errors.accountType && <p className="text-xs text-destructive">{errors.accountType.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="currencyCode">Currency Code</Label>
          <Input 
            id="currencyCode"
            placeholder="USD, EUR, etc." 
            {...register('currencyCode')} 
          />
          {errors.currencyCode && <p className="text-xs text-destructive">{errors.currencyCode.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="openingBalance">Opening Balance</Label>
        <Input 
          id="openingBalance"
          type="number" 
          step="0.01" 
          {...register('openingBalance', { valueAsNumber: true })} 
          disabled={!!initialData}
        />
        {initialData && (
          <p className="text-xs text-muted-foreground">Opening balance cannot be changed after creation.</p>
        )}
        {errors.openingBalance && <p className="text-xs text-destructive">{errors.openingBalance.message}</p>}
      </div>

      <div className="flex flex-row items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label className="text-base">Default Account</Label>
          <p className="text-sm text-muted-foreground">
            Automatically select this account for new transactions.
          </p>
        </div>
        <Switch
          checked={isDefault}
          onCheckedChange={(val) => setValue('isDefault', val, { shouldDirty: true })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea 
          id="notes"
          placeholder="Optional notes about this account" 
          {...register('notes')} 
        />
        {errors.notes && <p className="text-xs text-destructive">{errors.notes.message}</p>}
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : initialData ? 'Update Account' : 'Create Account'}
        </Button>
      </div>
    </form>
  );
}
