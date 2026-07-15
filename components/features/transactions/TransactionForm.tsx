'use client';

import { useEffect, useState, useTransition } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { browserTransactionInputSchema } from '@/schemas/transaction.schema';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createTransactionAction, updateTransactionAction } from '@/app/(dashboard)/transactions/actions';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Transaction } from '@/types/transaction.types';
import { Account } from '@/types/account.types';
import { Category } from '@/types/category.types';

type FormData = z.infer<typeof browserTransactionInputSchema>;

interface TransactionFormProps {
  initialData?: Transaction | null;
  accounts?: Account[];
  categories?: Category[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TransactionForm({ initialData, accounts = [], categories = [], onSuccess, onCancel }: TransactionFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(browserTransactionInputSchema) as any,
    defaultValues: {
      transactionDate: new Date().toISOString().split('T')[0],
      transactionType: 'Expense',
      description: '',
      categoryId: '',
      accountId: '',
      amount: 0,
      subcategoryCode: '',
      currencyCode: '',
      paymentMethodCode: '',
      reference: '',
      notes: '',
      tags: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        transactionDate: initialData.transactionDate.split('T')[0],
        transactionType: initialData.transactionType,
        description: initialData.description,
        categoryId: initialData.categoryId,
        accountId: initialData.accountId,
        amount: initialData.amount,
        subcategoryCode: initialData.subcategoryCode || '',
        currencyCode: initialData.currencyCode || '',
        paymentMethodCode: initialData.paymentMethodCode || '',
        reference: initialData.reference || '',
        notes: initialData.notes || '',
        tags: initialData.tags || '',
      });
    }
  }, [initialData, reset]);

  const transactionType = useWatch({ control, name: 'transactionType' });
  const categoryId = useWatch({ control, name: 'categoryId' });
  const accountId = useWatch({ control, name: 'accountId' });

  // Filter categories dynamically based on Income vs Expense
  const filteredCategories = categories.filter(c => c.transactionType === transactionType);

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    startTransition(async () => {
      try {
        let result;
        if (isEdit && initialData) {
          result = await updateTransactionAction(initialData.systemId, initialData.etag, data);
        } else {
          result = await createTransactionAction(null, data);
        }

        if (result.status === 'success') {
          toast.success(result.message || (isEdit ? 'Transaction updated' : 'Transaction created'));
          reset();
          router.refresh();
          onSuccess?.();
        } else {
          const msg = result.message || 'Something went wrong';
          setServerError(msg);
          toast.error(msg);
        }
      } catch {
        const msg = 'An unexpected error occurred';
        setServerError(msg);
        toast.error(msg);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
          {serverError}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="transactionType">Type</Label>
          <Select 
            value={transactionType} 
            onValueChange={(val) => {
              if (!val) return;
              setValue('transactionType', val as 'Income' | 'Expense', { shouldDirty: true });
              setValue('categoryId', '', { shouldDirty: true }); // Reset category on type change
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Income">Income</SelectItem>
              <SelectItem value="Expense">Expense</SelectItem>
            </SelectContent>
          </Select>
          {errors.transactionType && <p className="text-xs text-destructive">{errors.transactionType.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="transactionDate">Date</Label>
          <Input 
            id="transactionDate" 
            type="date" 
            {...register('transactionDate')} 
          />
          {errors.transactionDate && <p className="text-xs text-destructive">{errors.transactionDate.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input 
          id="description" 
          placeholder="What was this for?" 
          {...register('description')} 
        />
        {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input 
            id="amount" 
            type="number" 
            step="0.01" 
            min="0"
            {...register('amount', { valueAsNumber: true })} 
          />
          {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="accountId">Account</Label>
          <Select 
            value={accountId} 
            onValueChange={(val) => setValue('accountId', val || '', { shouldDirty: true, shouldValidate: true })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map(acc => (
                <SelectItem key={acc.systemId} value={acc.systemId}>
                  {acc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.accountId && <p className="text-xs text-destructive">{errors.accountId.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="categoryId">Category</Label>
        <Select 
          value={categoryId || ''} 
          onValueChange={(val) => setValue('categoryId', val || '', { shouldDirty: true, shouldValidate: true })}
        >
          <SelectTrigger>
            <SelectValue placeholder={`Select ${transactionType.toLowerCase()} category`} />
          </SelectTrigger>
          <SelectContent>
            {filteredCategories.map(cat => (
              <SelectItem key={cat.systemId} value={cat.systemId}>
                {cat.name}
              </SelectItem>
            ))}
            {filteredCategories.length === 0 && (
              <div className="p-2 text-sm text-muted-foreground text-center">No categories found</div>
            )}
          </SelectContent>
        </Select>
        {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="reference">Reference (Optional)</Label>
        <Input 
          id="reference" 
          placeholder="Receipt or invoice number" 
          {...register('reference')} 
        />
        {errors.reference && <p className="text-xs text-destructive">{errors.reference.message}</p>}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isPending || (!isDirty && isEdit)}>
          {isPending ? 'Saving...' : isEdit ? 'Update Transaction' : 'Create Transaction'}
        </Button>
      </div>
    </form>
  );
}
