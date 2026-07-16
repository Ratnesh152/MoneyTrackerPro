import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LoanPaymentRow } from './LoanPaymentRow';
import { LoanPaymentHistoryEntry } from '@/types/loan-payment.types';

interface LoanPaymentTableProps {
  history: LoanPaymentHistoryEntry[];
  currencyCode: string;
  onEditPayment: (payment: LoanPaymentHistoryEntry) => void;
}

export function LoanPaymentTable({ history, currencyCode, onEditPayment }: LoanPaymentTableProps) {
  if (!history || history.length === 0) {
    return (
      <div className="flex h-32 flex-col items-center justify-center text-muted-foreground">
        <p className="text-sm">No payment history available.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-16 text-center">EMI #</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Payment Date</TableHead>
            <TableHead className="text-right">Days Late</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Remaining Bal.</TableHead>
            <TableHead className="text-center">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history.map((payment) => (
            <LoanPaymentRow
              key={payment.systemId}
              payment={payment}
              currencyCode={currencyCode}
              onEdit={onEditPayment}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
