'use client';

import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { categorySchema, CategoryFormData } from '@/schemas/category.schema';
import { Category } from '@/types/category.types';
import { createCategoryAction, updateCategoryAction } from '@/app/(dashboard)/categories/actions';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CategoryFormProps {
  initialData?: Category;
  onSuccess?: () => void;
}

export function CategoryForm({ initialData, onSuccess }: CategoryFormProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema) as any,
    defaultValues: {
      code: initialData?.code || '',
      name: initialData?.name || '',
      transactionType: initialData?.transactionType || 'Expense',
      isActive: initialData?.isActive ?? true,
      displayOrder: initialData?.displayOrder || 0,
      colorCode: initialData?.colorCode || '#000000',
      iconName: initialData?.iconName || 'Wallet',
    },
  });

  const transactionType = useWatch({ control, name: 'transactionType' });
  const isActive = useWatch({ control, name: 'isActive' });

  const onSubmit = async (data: CategoryFormData) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      let result;
      if (initialData) {
        result = await updateCategoryAction(initialData.systemId, initialData.etag, formData);
      } else {
        result = await createCategoryAction(formData);
      }

      if (result.success) {
        toast.success(initialData ? 'Category updated' : 'Category created');
        router.refresh();
        onSuccess?.();
      } else {
        toast.error(result.error || 'Something went wrong');
      }
    } catch {
      toast.error('An unexpected error occurred');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="code">Category Code</Label>
          <Input 
            id="code"
            placeholder="e.g., FOOD" 
            {...register('code')} 
            disabled={!!initialData}
          />
          {errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Display Name</Label>
          <Input 
            id="name"
            placeholder="e.g., Food & Dining" 
            {...register('name')} 
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="transactionType">Type</Label>
          <Select 
            value={transactionType} 
            onValueChange={(val) => {
              if (!val) return;
              setValue('transactionType', val as 'Income' | 'Expense', { shouldDirty: true });
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
          <Label htmlFor="displayOrder">Display Order</Label>
          <Input 
            id="displayOrder"
            type="number"
            {...register('displayOrder', { valueAsNumber: true })} 
          />
          {errors.displayOrder && <p className="text-xs text-destructive">{errors.displayOrder.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="colorCode">Color (Hex)</Label>
          <Input 
            id="colorCode"
            type="color"
            {...register('colorCode')} 
            className="h-10 p-1 cursor-pointer"
          />
          {errors.colorCode && <p className="text-xs text-destructive">{errors.colorCode.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="iconName">Icon Name (Lucide)</Label>
          <Input 
            id="iconName"
            placeholder="e.g., Coffee" 
            {...register('iconName')} 
          />
          {errors.iconName && <p className="text-xs text-destructive">{errors.iconName.message}</p>}
        </div>
      </div>

      <div className="flex flex-row items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label className="text-base">Active Category</Label>
          <p className="text-sm text-muted-foreground">
            Allow this category to be selected for new transactions.
          </p>
        </div>
        <Switch
          checked={isActive}
          onCheckedChange={(val) => setValue('isActive', val, { shouldDirty: true })}
        />
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : initialData ? 'Update Category' : 'Create Category'}
        </Button>
      </div>
    </form>
  );
}
