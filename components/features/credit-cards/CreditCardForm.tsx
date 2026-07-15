'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm as useReactHookForm } from 'react-hook-form';
import { CreditCardFormData, creditCardSchema } from '@/schemas/credit-card.schema';
import { CreditCard, MTCreditCardNetwork } from '@/types/credit-card.types';
import { createCreditCardAction, updateCreditCardAction } from '@/app/(dashboard)/credit-cards/actions';
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

interface CreditCardFormProps {
  initialData?: CreditCard;
  onSuccess: () => void;
}

export function CreditCardForm({ initialData, onSuccess }: CreditCardFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useReactHookForm<CreditCardFormData>({
    resolver: zodResolver(creditCardSchema) as any,
    defaultValues: initialData ? {
      cardName: initialData.cardName,
      issuingBank: initialData.issuingBank,
      cardNetwork: initialData.cardNetwork,
      last4Digits: initialData.last4Digits,
      creditLimit: initialData.creditLimit,
      currencyCode: initialData.currencyCode || 'INR',
      statementDay: initialData.statementDay,
      dueDay: initialData.dueDay,
      interestRate: initialData.interestRate,
      annualFee: initialData.annualFee,
      supportsEMI: initialData.supportsEMI,
      isActive: initialData.isActive,
      notes: initialData.notes || '',
    } : {
      currencyCode: 'INR',
      interestRate: 0,
      annualFee: 0,
      supportsEMI: false,
      isActive: true,
      notes: '',
    },
  });

  const cardNetwork = watch('cardNetwork');
  const isActive = watch('isActive');
  const supportsEMI = watch('supportsEMI');

  const onSubmit = async (data: CreditCardFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = initialData
        ? await updateCreditCardAction(initialData.systemId, initialData.etag, data)
        : await createCreditCardAction(data);

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto px-2">
      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cardName">Card Name</Label>
          <Input id="cardName" placeholder="e.g., Sapphire Reserve" {...register('cardName')} />
          {errors.cardName && <p className="text-xs text-destructive">{errors.cardName.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="issuingBank">Issuing Bank</Label>
          <Input id="issuingBank" placeholder="e.g., Chase" {...register('issuingBank')} />
          {errors.issuingBank && <p className="text-xs text-destructive">{errors.issuingBank.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cardNetwork">Card Network</Label>
          <Select 
            value={cardNetwork} 
            onValueChange={(val) => {
              if (val) setValue('cardNetwork', val as MTCreditCardNetwork, { shouldDirty: true, shouldValidate: true });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select network" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Visa">Visa</SelectItem>
              <SelectItem value="MasterCard">MasterCard</SelectItem>
              <SelectItem value="RuPay">RuPay</SelectItem>
              <SelectItem value="Amex">Amex</SelectItem>
              <SelectItem value="Discover">Discover</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
          {errors.cardNetwork && <p className="text-xs text-destructive">{errors.cardNetwork.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="last4Digits">Last 4 Digits</Label>
          <Input id="last4Digits" placeholder="1234" maxLength={4} {...register('last4Digits')} />
          {errors.last4Digits && <p className="text-xs text-destructive">{errors.last4Digits.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="creditLimit">Credit Limit</Label>
          <Input 
            id="creditLimit" 
            type="number" 
            step="0.01" 
            placeholder="0.00" 
            {...register('creditLimit', { valueAsNumber: true })} 
          />
          {errors.creditLimit && <p className="text-xs text-destructive">{errors.creditLimit.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="currencyCode">Currency</Label>
          <Input id="currencyCode" placeholder="INR" {...register('currencyCode')} />
          {errors.currencyCode && <p className="text-xs text-destructive">{errors.currencyCode.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="statementDay">Statement Day (1-31)</Label>
          <Input 
            id="statementDay" 
            type="number" 
            min="1" max="31"
            {...register('statementDay', { valueAsNumber: true })} 
          />
          {errors.statementDay && <p className="text-xs text-destructive">{errors.statementDay.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="dueDay">Due Day (1-31)</Label>
          <Input 
            id="dueDay" 
            type="number" 
            min="1" max="31"
            {...register('dueDay', { valueAsNumber: true })} 
          />
          {errors.dueDay && <p className="text-xs text-destructive">{errors.dueDay.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="annualFee">Annual Fee</Label>
          <Input 
            id="annualFee" 
            type="number" 
            step="0.01"
            {...register('annualFee', { valueAsNumber: true })} 
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="interestRate">Interest Rate (%)</Label>
          <Input 
            id="interestRate" 
            type="number" 
            step="0.01"
            {...register('interestRate', { valueAsNumber: true })} 
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 py-2">
        <div className="flex items-center space-x-2">
          <Switch 
            id="isActive" 
            checked={isActive} 
            onCheckedChange={(checked) => setValue('isActive', checked, { shouldDirty: true })}
          />
          <Label htmlFor="isActive">Active Card</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch 
            id="supportsEMI" 
            checked={supportsEMI} 
            onCheckedChange={(checked) => setValue('supportsEMI', checked, { shouldDirty: true })}
          />
          <Label htmlFor="supportsEMI">Supports EMI</Label>
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
          {initialData ? 'Update Credit Card' : 'Add Credit Card'}
        </Button>
      </div>
    </form>
  );
}
