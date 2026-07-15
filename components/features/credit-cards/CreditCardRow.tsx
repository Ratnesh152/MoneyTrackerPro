'use client';

import { CreditCard } from '@/types/credit-card.types';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CreditCardRowProps {
  creditCard: CreditCard;
  onEdit: (creditCard: CreditCard) => void;
  onDelete: (creditCard: CreditCard) => void;
}

export function CreditCardRow({ creditCard, onEdit, onDelete }: CreditCardRowProps) {
  const getNetworkBadgeVariant = (network: string) => {
    switch (network) {
      case 'Visa': return 'default';
      case 'MasterCard': return 'secondary';
      case 'Amex': return 'destructive';
      case 'RuPay': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <TableRow>
      <TableCell className="font-medium">
        <div>{creditCard.cardName}</div>
        <div className="text-xs text-muted-foreground">{creditCard.issuingBank} •••• {creditCard.last4Digits}</div>
      </TableCell>
      <TableCell>
        <Badge variant={getNetworkBadgeVariant(creditCard.cardNetwork)}>
          {creditCard.cardNetwork}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        {new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: creditCard.currencyCode || 'INR',
        }).format(creditCard.creditLimit)}
      </TableCell>
      <TableCell className="text-center">
        {creditCard.statementDay}
      </TableCell>
      <TableCell className="text-center">
        {creditCard.dueDay}
      </TableCell>
      <TableCell className="text-center">
        <Badge variant={creditCard.isActive ? "secondary" : "outline"}>
          {creditCard.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <Button variant="ghost" size="icon" onClick={() => onEdit(creditCard)}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onDelete(creditCard)}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
