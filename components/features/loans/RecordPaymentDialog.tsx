'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LoanPaymentForm } from './LoanPaymentForm';
import { LoanPaymentFormData } from '@/schemas/loan-payment.schema';
import { LoanPaymentHistoryEntry } from '@/types/loan-payment.types';

interface RecordPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Partial<LoanPaymentHistoryEntry>;
  defaultEmiNumber: number;
  defaultAmount: number;
  onSubmit: (data: LoanPaymentFormData) => Promise<void>;
  isSubmitting?: boolean;
}

export function RecordPaymentDialog({
  open,
  onOpenChange,
  initialData,
  defaultEmiNumber,
  defaultAmount,
  onSubmit,
  isSubmitting
}: RecordPaymentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {initialData?.systemId ? 'Edit Payment Record' : 'Record EMI Payment'}
          </DialogTitle>
        </DialogHeader>
        
        <LoanPaymentForm
          initialData={initialData}
          defaultEmiNumber={defaultEmiNumber}
          defaultAmount={defaultAmount}
          onSubmit={async (data) => {
            await onSubmit(data);
            onOpenChange(false);
          }}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
