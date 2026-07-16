import { TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Undo2, Pencil } from 'lucide-react';
import { LoanPaymentHistoryEntry } from '@/types/loan-payment.types';

interface LoanPaymentRowProps {
  payment: LoanPaymentHistoryEntry;
  currencyCode: string;
  onEdit: (payment: LoanPaymentHistoryEntry) => void;
  onReverse: (systemId: string, etag: string) => void;
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

export function LoanPaymentRow({ payment, currencyCode, onEdit, onReverse }: LoanPaymentRowProps) {
  const isOverdue = payment.daysLate > 0;
  const isPaid = payment.status === 'Paid' || payment.status === 'Partially Paid';
  
  return (
    <TableRow className="cursor-pointer hover:bg-muted/50" onClick={() => !isPaid && payment.status !== 'Cancelled' && onEdit(payment)}>
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
      <TableCell className="text-right">
        {isPaid ? (
          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger className={buttonVariants({ variant: 'ghost', className: 'h-8 w-8 p-0' })}>
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onReverse(payment.systemId, payment.etag)} className="text-destructive focus:text-destructive">
                  <Undo2 className="mr-2 h-4 w-4" />
                  Reverse Payment
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={(e) => { e.stopPropagation(); onEdit(payment); }} 
            disabled={payment.status === 'Cancelled'}
          >
             <Pencil className="h-4 w-4" />
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}
