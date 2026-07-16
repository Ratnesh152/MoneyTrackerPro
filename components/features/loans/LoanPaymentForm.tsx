'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { loanPaymentSchema, LoanPaymentFormData } from '@/schemas/loan-payment.schema';
import { MTLoanPaymentMethod, MTLoanPaymentStatus, LoanPaymentHistoryEntry } from '@/types/loan-payment.types';

interface LoanPaymentFormProps {
  initialData?: Partial<LoanPaymentHistoryEntry>;
  defaultEmiNumber: number;
  defaultAmount: number;
  onSubmit: (data: LoanPaymentFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const PAYMENT_METHODS: MTLoanPaymentMethod[] = [
  'Bank Transfer', 'UPI', 'Cash', 'Cheque', 'Auto Debit', 'Card', 'Other'
];

const PAYMENT_STATUSES: MTLoanPaymentStatus[] = [
  'Pending', 'Paid', 'Partially Paid', 'Skipped', 'Cancelled'
];

export function LoanPaymentForm({
  initialData,
  defaultEmiNumber,
  defaultAmount,
  onSubmit,
  onCancel,
  isSubmitting
}: LoanPaymentFormProps) {
  
  const isPaid = initialData?.status === 'Paid';

  const { register, control, handleSubmit, formState: { errors } } = useForm<LoanPaymentFormData>({
    resolver: zodResolver(loanPaymentSchema),
    defaultValues: {
      paymentDate: initialData?.paymentDate || new Date().toISOString().split('T')[0],
      emiNumber: initialData?.emiNumber || defaultEmiNumber,
      amountPaid: initialData?.amountPaid ?? defaultAmount,
      paymentMethod: initialData?.paymentMethod || 'Bank Transfer',
      transactionReference: initialData?.transactionReference || '',
      notes: initialData?.notes || '',
      status: initialData?.status || 'Paid',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="emiNumber">EMI Number</Label>
          <Input 
            id="emiNumber"
            type="number" 
            disabled={isPaid}
            {...register('emiNumber', { valueAsNumber: true })} 
          />
          {errors.emiNumber && <p className="text-xs text-destructive">{errors.emiNumber.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="paymentDate">Payment Date</Label>
          <Input 
            id="paymentDate"
            type="date" 
            disabled={isPaid} 
            {...register('paymentDate')} 
          />
          {errors.paymentDate && <p className="text-xs text-destructive">{errors.paymentDate.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amountPaid">Amount Paid</Label>
          <Input 
            id="amountPaid"
            type="number" 
            step="0.01"
            disabled={isPaid}
            {...register('amountPaid', { valueAsNumber: true })} 
          />
          {errors.amountPaid && <p className="text-xs text-destructive">{errors.amountPaid.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPaid && initialData?.status !== 'Cancelled'}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_STATUSES.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.status && <p className="text-xs text-destructive">{errors.status.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="paymentMethod">Payment Method</Label>
          <Controller
            control={control}
            name="paymentMethod"
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map(m => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.paymentMethod && <p className="text-xs text-destructive">{errors.paymentMethod.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="transactionReference">Transaction Reference</Label>
          <Input 
            id="transactionReference"
            placeholder="e.g. UTR or Cheque No." 
            {...register('transactionReference')} 
          />
          {errors.transactionReference && <p className="text-xs text-destructive">{errors.transactionReference.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea 
          id="notes"
          placeholder="Any additional notes..." 
          {...register('notes')} 
        />
        {errors.notes && <p className="text-xs text-destructive">{errors.notes.message}</p>}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Payment'}
        </Button>
      </div>
    </form>
  );
}
