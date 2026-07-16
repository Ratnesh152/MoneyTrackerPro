import { TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { LoanPaymentHistoryEntry } from '@/types/loan-payment.types';

interface LoanPaymentRowProps {
  payment: LoanPaymentHistoryEntry;
  currencyCode: string;
  onEdit: (payment: LoanPaymentHistoryEntry) => void;
}

const fmt = (n: number, currency: string) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency || 'INR',
    maximumFractionDigits: 0,
  }).format(n);

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

export function LoanPaymentRow({ payment, currencyCode, onEdit }: LoanPaymentRowProps) {
  const isOverdue = payment.daysLate > 0;
  
  return (
    <TableRow className="cursor-pointer hover:bg-muted/50" onClick={() => onEdit(payment)}>
      <TableCell className="text-center text-sm font-medium">{payment.emiNumber}</TableCell>
      <TableCell className="text-sm">{fmtDate(payment.dueDate)}</TableCell>
      <TableCell className="text-sm">{payment.paymentDate ? fmtDate(payment.paymentDate) : '-'}</TableCell>
      <TableCell className="text-right text-sm">
        {isOverdue ? <span className="text-destructive font-medium">{payment.daysLate} days</span> : '-'}
      </TableCell>
      <TableCell className="text-right text-sm font-medium">{fmt(payment.amountPaid, currencyCode)}</TableCell>
      <TableCell className="text-right text-sm text-muted-foreground">{fmt(payment.remainingBalanceAfterPayment, currencyCode)}</TableCell>
      <TableCell className="text-center">
        <Badge
          variant={
            payment.status === 'Paid'
              ? 'default'
              : payment.status === 'Partially Paid'
              ? 'secondary'
              : payment.status === 'Skipped'
              ? 'destructive'
              : payment.status === 'Cancelled'
              ? 'outline'
              : 'outline'
          }
        >
          {payment.status}
        </Badge>
      </TableCell>
    </TableRow>
  );
}
