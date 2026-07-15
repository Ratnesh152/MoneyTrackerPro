'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { budgetSchema, BudgetSchema } from '@/schemas/budget.schema';
import { Budget } from '@/types/budget.types';
import { Category } from '@/types/category.types';
import { createBudgetAction, updateBudgetAction } from '@/app/(dashboard)/budgets/actions';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface BudgetFormProps {
  initialData?: Budget;
  categories: Category[];
  onSuccess?: () => void;
}

export function BudgetForm({ initialData, categories, onSuccess }: BudgetFormProps) {
  const router = useRouter();
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BudgetSchema>({
    resolver: zodResolver(budgetSchema) as any,
    defaultValues: {
      categoryId: initialData?.categoryId || '',
      budgetMonth: initialData?.budgetMonth || currentMonth,
      budgetYear: initialData?.budgetYear || currentYear,
      budgetAmount: initialData?.budgetAmount || 0,
      notes: initialData?.notes || '',
    },
  });

  const categoryId = watch('categoryId');

  const onSubmit = async (data: BudgetSchema) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      let result;
      if (initialData?.systemId) {
        result = await updateBudgetAction(initialData.systemId, initialData.etag, formData);
      } else {
        result = await createBudgetAction(formData);
      }

      if (result.success) {
        toast.success(initialData ? 'Budget updated successfully' : 'Budget created successfully');
        if (onSuccess) {
          onSuccess();
        } else {
          router.push('/budgets');
        }
      } else {
        toast.error(result.error || 'Something went wrong');
      }
    } catch (error) {
      console.error(error);
      toast.error('An unexpected error occurred');
    }
  };

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  const years = Array.from({ length: 5 }, (_, i) => currentYear + i - 1);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 py-4">
        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="categoryId">Category</Label>
          <Select 
            disabled={!!initialData} // Cannot change category of existing budget
            value={categoryId} 
            onValueChange={(val) => setValue('categoryId', val || '', { shouldValidate: true })}
          >
            <SelectTrigger id="categoryId">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.systemId} value={c.systemId}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.categoryId && <p className="text-sm text-destructive">{errors.categoryId.message}</p>}
        </div>

        {/* Month and Year */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="budgetMonth">Month</Label>
            <Select 
              disabled={!!initialData} 
              defaultValue={initialData?.budgetMonth?.toString() || currentMonth.toString()}
              onValueChange={(val) => setValue('budgetMonth', parseInt(val || '0'), { shouldValidate: true })}
            >
              <SelectTrigger id="budgetMonth">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((m) => (
                  <SelectItem key={m.value} value={m.value.toString()}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.budgetMonth && <p className="text-sm text-destructive">{errors.budgetMonth.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="budgetYear">Year</Label>
            <Select 
              disabled={!!initialData} 
              defaultValue={initialData?.budgetYear?.toString() || currentYear.toString()}
              onValueChange={(val) => setValue('budgetYear', parseInt(val || '0'), { shouldValidate: true })}
            >
              <SelectTrigger id="budgetYear">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.budgetYear && <p className="text-sm text-destructive">{errors.budgetYear.message}</p>}
          </div>
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <Label htmlFor="budgetAmount">Budget Amount</Label>
          <Input
            id="budgetAmount"
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register('budgetAmount')}
          />
          {errors.budgetAmount && <p className="text-sm text-destructive">{errors.budgetAmount.message}</p>}
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Textarea
            id="notes"
            placeholder="Additional context or limits..."
            {...register('notes')}
          />
          {errors.notes && <p className="text-sm text-destructive">{errors.notes.message}</p>}
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => {
            if (onSuccess) onSuccess();
            else router.push('/budgets');
          }}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : initialData ? 'Update Budget' : 'Create Budget'}
        </Button>
      </div>
    </form>
  );
}
