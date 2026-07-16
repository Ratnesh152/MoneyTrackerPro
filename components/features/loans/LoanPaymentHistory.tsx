'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { LoanPaymentTable } from './LoanPaymentTable';
import { RecordPaymentDialog } from './RecordPaymentDialog';
import { LoanPaymentHistoryEntry } from '@/types/loan-payment.types';
import { LoanPaymentFormData } from '@/schemas/loan-payment.schema';

interface LoanPaymentHistoryProps {
  history: LoanPaymentHistoryEntry[];
  currencyCode: string;
  defaultEmiNumber: number;
  defaultAmount: number;
  onRecordPayment: (data: LoanPaymentFormData, existingSystemId?: string) => Promise<void>;
  isSubmitting?: boolean;
}

export function LoanPaymentHistory({
  history,
  currencyCode,
  defaultEmiNumber,
  defaultAmount,
  onRecordPayment,
  isSubmitting
}: LoanPaymentHistoryProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<LoanPaymentHistoryEntry | undefined>(undefined);

  const handleOpenNew = () => {
    setEditingPayment(undefined);
    setIsDialogOpen(true);
  };

  const handleEdit = (payment: LoanPaymentHistoryEntry) => {
    setEditingPayment(payment);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (data: LoanPaymentFormData) => {
    await onRecordPayment(data, editingPayment?.systemId);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-semibold">Payment History</CardTitle>
            <CardDescription>Record and track your EMI payments</CardDescription>
          </div>
          <Button onClick={handleOpenNew} size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            Record Payment
          </Button>
        </CardHeader>
        <CardContent>
          <LoanPaymentTable
            history={history}
            currencyCode={currencyCode}
            onEditPayment={handleEdit}
          />
        </CardContent>
      </Card>

      <RecordPaymentDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        initialData={editingPayment}
        defaultEmiNumber={defaultEmiNumber}
        defaultAmount={defaultAmount}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </>
  );
}
