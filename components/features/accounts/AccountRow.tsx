'use client';

import { MoreHorizontal, Edit2, Trash2 } from 'lucide-react';
import { Account } from '@/types/account.types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface AccountRowProps {
  account: Account;
  onEdit: (account: Account) => void;
  onDelete: (account: Account) => void;
}

export function AccountRow({ account, onEdit, onDelete }: AccountRowProps) {
  const formattedBalance = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: account.currencyCode || 'USD',
  }).format(account.openingBalance);

  return (
    <TableRow>
      <TableCell className="font-medium">
        {account.name}
        {account.isDefault && (
          <Badge variant="secondary" className="ml-2 text-[10px]">
            Default
          </Badge>
        )}
      </TableCell>
      <TableCell>
        <Badge variant="outline">{account.accountType}</Badge>
      </TableCell>
      <TableCell>{account.currencyCode || '-'}</TableCell>
      <TableCell className="text-right font-medium">{formattedBalance}</TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(account)}>
              <Edit2 className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(account)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
