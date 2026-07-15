'use client';

import { Transaction } from '@/types/transaction.types';
import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

interface TransactionRowProps {
  transaction: Transaction;
  onEdit: () => void;
  onDelete: () => void;
}

export function TransactionRow({ transaction, onEdit, onDelete }: TransactionRowProps) {
  const isIncome = transaction.transactionType === 'Income';

  return (
    <TableRow>
      <TableCell className="whitespace-nowrap">
        {transaction.transactionDate.split('T')[0]}
      </TableCell>
      <TableCell>
        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${isIncome ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'}`}>
          {transaction.transactionType}
        </span>
      </TableCell>
      <TableCell className="max-w-[200px] truncate" title={transaction.description}>
        {transaction.description}
        {transaction.reference && (
          <span className="block text-xs text-muted-foreground truncate">
            Ref: {transaction.reference}
          </span>
        )}
      </TableCell>
      <TableCell>
        {transaction.categoryName || transaction.categoryCode}
      </TableCell>
      <TableCell>
        {transaction.accountName || transaction.accountCode}
      </TableCell>
      <TableCell className={`text-right font-medium whitespace-nowrap ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>
        {isIncome ? '+' : '-'}${transaction.amount.toFixed(2)}
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
