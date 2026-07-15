'use client';

import { useRouter } from 'next/navigation';
import { Loan } from '@/types/loan.types';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { Edit, Eye, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface LoanRowProps {
  loan: Loan;
  onEdit: (loan: Loan) => void;
  onDelete: (loan: Loan) => void;
}

export function LoanRow({ loan, onEdit, onDelete }: LoanRowProps) {
  const router = useRouter();
  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'Home': return 'default';
      case 'Personal': return 'secondary';
      case 'Vehicle': return 'outline';
      case 'Education': return 'secondary';
      case 'Business': return 'default';
      case 'Gold': return 'outline';
      case 'Mortgage': return 'default';
      default: return 'outline';
    }
  };

  return (
    <TableRow>
      <TableCell className="font-medium">
        <div>{loan.loanName}</div>
        <div className="text-xs text-muted-foreground">{loan.lenderName}</div>
        {loan.loanAccountNumber && (
          <div className="text-xs text-muted-foreground mt-0.5">Acc: {loan.loanAccountNumber}</div>
        )}
      </TableCell>
      <TableCell>
        <Badge variant={getTypeBadgeVariant(loan.loanType)}>
          {loan.loanType}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        {new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: loan.currencyCode || 'INR',
          maximumFractionDigits: 0,
        }).format(loan.principalAmount)}
      </TableCell>
      <TableCell className="text-right">
        {loan.interestRate}%
      </TableCell>
      <TableCell className="text-right">
        {loan.tenureMonths} mo
      </TableCell>
      <TableCell className="text-right font-medium">
        {new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: loan.currencyCode || 'INR',
          maximumFractionDigits: 0,
        }).format(loan.emiAmount)}
      </TableCell>
      <TableCell className="text-center">
        <Badge variant={loan.status === 'Active' ? "secondary" : "outline"}>
          {loan.status}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <Button
          variant="ghost"
          size="icon"
          title="View Details"
          onClick={() => router.push(`/loans/${loan.systemId}`)}
        >
          <Eye className="h-4 w-4 text-muted-foreground" />
        </Button>
        <Button variant="ghost" size="icon" title="Edit" onClick={() => onEdit(loan)}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" title="Delete" onClick={() => onDelete(loan)}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
