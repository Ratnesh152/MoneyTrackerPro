'use client';

import { LoanPaymentHistory } from '@/components/features/loans/LoanPaymentHistory';
import { LoanPaymentFormData } from '@/schemas/loan-payment.schema';
import { LoanPaymentHistoryEntry } from '@/types/loan-payment.types';
import { recordLoanPaymentAction, updateLoanPaymentAction } from '../actions';
import { toast } from 'sonner';

interface LoanPaymentClientWrapperProps {
  history: LoanPaymentHistoryEntry[];
  currencyCode: string;
  defaultEmiNumber: number;
  defaultAmount: number;
  loanSystemId: string;
}

export function LoanPaymentClientWrapper({
  history,
  currencyCode,
  defaultEmiNumber,
  defaultAmount,
  loanSystemId,
}: LoanPaymentClientWrapperProps) {
  const handleRecordPayment = async (data: LoanPaymentFormData, existingSystemId?: string) => {
    try {
      if (existingSystemId) {
        // Editing existing payment
        const payment = history.find(p => p.systemId === existingSystemId);
        if (!payment) return;
        
        const res = await updateLoanPaymentAction(existingSystemId, loanSystemId, payment.etag, {
          ...data,
          transactionReference: data.transactionReference || undefined,
          notes: data.notes || undefined,
        });
        if (res.success) {
          toast.success('Payment updated successfully');
        } else {
          toast.error(res.error || 'Failed to update payment');
        }
      } else {
        // Recording new payment
        const res = await recordLoanPaymentAction({
          ...data,
          loanSystemId,
          transactionReference: data.transactionReference || undefined,
          notes: data.notes || undefined,
        });
        if (res.success) {
          toast.success('Payment recorded successfully');
        } else {
          toast.error(res.error || 'Failed to record payment');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    }
  };

  return (
    <LoanPaymentHistory
      history={history}
      currencyCode={currencyCode}
      defaultEmiNumber={defaultEmiNumber}
      defaultAmount={defaultAmount}
      onRecordPayment={handleRecordPayment}
    />
  );
}
