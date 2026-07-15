'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { LoanFormData, loanSchema } from '@/schemas/loan.schema';
import { Loan, MTLoanType } from '@/types/loan.types';
import { createLoanAction, updateLoanAction } from '@/app/(dashboard)/loans/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface LoanFormProps {
  initialData?: Loan;
  onSuccess: () => void;
}

export function LoanForm({ initialData, onSuccess }: LoanFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoanFormData>({
    resolver: zodResolver(loanSchema) as any,
    defaultValues: initialData ? {
      loanName: initialData.loanName,
      lenderName: initialData.lenderName,
      loanType: initialData.loanType,
      principalAmount: initialData.principalAmount,
      interestRate: initialData.interestRate,
      tenureMonths: initialData.tenureMonths,
      emiAmount: initialData.emiAmount,
      startDate: initialData.startDate.split('T')[0],
      loanAccountNumber: initialData.loanAccountNumber,
      currencyCode: initialData.currencyCode || 'INR',
      supportsPrepayment: initialData.supportsPrepayment,
      status: initialData.status,
      notes: initialData.notes || '',
    } : {
      currencyCode: 'INR',
      interestRate: 0,
      supportsPrepayment: false,
      status: 'Active',
      notes: '',
    },
  });

  const loanType = watch('loanType');
  const status = watch('status');
  const supportsPrepayment = watch('supportsPrepayment');

  const onSubmit = async (data: LoanFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = initialData
        ? await updateLoanAction(initialData.systemId, initialData.etag, data)
        : await createLoanAction(data);

      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || 'Something went wrong.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[75vh] overflow-y-auto px-2 pb-2">
      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="loanName">Loan Name</Label>
          <Input id="loanName" placeholder="e.g., Home Loan" {...register('loanName')} />
          {errors.loanName && <p className="text-xs text-destructive">{errors.loanName.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lenderName">Lender / Bank</Label>
          <Input id="lenderName" placeholder="e.g., SBI" {...register('lenderName')} />
          {errors.lenderName && <p className="text-xs text-destructive">{errors.lenderName.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="loanAccountNumber">Loan Account Number</Label>
          <Input id="loanAccountNumber" placeholder="e.g., L-123456" {...register('loanAccountNumber')} />
          {errors.loanAccountNumber && <p className="text-xs text-destructive">{errors.loanAccountNumber.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="loanType">Loan Type</Label>
          <Select 
            value={loanType} 
            onValueChange={(val) => {
              if (val) setValue('loanType', val as MTLoanType, { shouldDirty: true, shouldValidate: true });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Home">Home</SelectItem>
              <SelectItem value="Personal">Personal</SelectItem>
              <SelectItem value="Vehicle">Vehicle</SelectItem>
              <SelectItem value="Education">Education</SelectItem>
              <SelectItem value="Business">Business</SelectItem>
              <SelectItem value="Gold">Gold</SelectItem>
              <SelectItem value="Mortgage">Mortgage</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
          {errors.loanType && <p className="text-xs text-destructive">{errors.loanType.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="currencyCode">Currency</Label>
          <Input id="currencyCode" placeholder="INR" {...register('currencyCode')} />
          {errors.currencyCode && <p className="text-xs text-destructive">{errors.currencyCode.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="principalAmount">Principal Amount</Label>
          <Input 
            id="principalAmount" 
            type="number" 
            step="0.01" 
            placeholder="0.00" 
            {...register('principalAmount', { valueAsNumber: true })} 
          />
          {errors.principalAmount && <p className="text-xs text-destructive">{errors.principalAmount.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="interestRate">Interest Rate (%)</Label>
          <Input 
            id="interestRate" 
            type="number" 
            step="0.01"
            placeholder="8.5"
            {...register('interestRate', { valueAsNumber: true })} 
          />
          {errors.interestRate && <p className="text-xs text-destructive">{errors.interestRate.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tenureMonths">Tenure (Months)</Label>
          <Input 
            id="tenureMonths" 
            type="number" 
            min="1"
            placeholder="240"
            {...register('tenureMonths', { valueAsNumber: true })} 
          />
          {errors.tenureMonths && <p className="text-xs text-destructive">{errors.tenureMonths.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="emiAmount">EMI Amount</Label>
          <Input 
            id="emiAmount" 
            type="number" 
            step="0.01" 
            placeholder="0.00" 
            {...register('emiAmount', { valueAsNumber: true })} 
          />
          {errors.emiAmount && <p className="text-xs text-destructive">{errors.emiAmount.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input 
            id="startDate" 
            type="date" 
            {...register('startDate')} 
          />
          {errors.startDate && <p className="text-xs text-destructive">{errors.startDate.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 py-2">
        <div className="flex items-center space-x-2">
          <Switch 
            id="status" 
            checked={status === 'Active'} 
            onCheckedChange={(checked) => setValue('status', checked ? 'Active' : 'Closed', { shouldDirty: true })}
          />
          <Label htmlFor="status">Is Active</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch 
            id="supportsPrepayment" 
            checked={supportsPrepayment} 
            onCheckedChange={(checked) => setValue('supportsPrepayment', checked, { shouldDirty: true })}
          />
          <Label htmlFor="supportsPrepayment">Supports Prepayment</Label>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea 
          id="notes" 
          placeholder="Any additional information..." 
          {...register('notes')} 
        />
        {errors.notes && <p className="text-xs text-destructive">{errors.notes.message}</p>}
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? 'Update Loan' : 'Add Loan'}
        </Button>
      </div>
    </form>
  );
}
