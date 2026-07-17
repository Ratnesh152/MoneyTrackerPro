"use client";

import React, { useState } from 'react';
import { RecurringTransaction, BCRecurringTransactionCreateDTO, BCRecurringTransactionUpdateDTO } from '@/types/recurring-transaction.types';
import { Account } from '@/types/account.types';
import { Category } from '@/types/category.types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Plus, Play, MoreHorizontal, Pencil, Trash } from 'lucide-react';
import { RecurringTransactionDialog } from './RecurringTransactionDialog';
import { format } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface RecurringTransactionTableProps {
  transactions: RecurringTransaction[];
  accounts: Account[];
  categories: Category[];
  ownerEntraObjectId: string;
  createAction: (dto: BCRecurringTransactionCreateDTO) => Promise<{ success: boolean; error?: string }>;
  updateAction: (systemId: string, dto: BCRecurringTransactionUpdateDTO, etag: string) => Promise<{ success: boolean; error?: string }>;
  deleteAction: (systemId: string, etag: string) => Promise<{ success: boolean; error?: string }>;
  runEngineAction: () => Promise<{ success: boolean; error?: string }>;
}

export function RecurringTransactionTable({
  transactions,
  accounts,
  categories,
  ownerEntraObjectId,
  createAction,
  updateAction,
  deleteAction,
  runEngineAction,
}: RecurringTransactionTableProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<RecurringTransaction | undefined>(undefined);
  const [isEngineRunning, setIsEngineRunning] = useState(false);

  const handleOpenNew = () => {
    setEditingTransaction(undefined);
    setIsDialogOpen(true);
  };

  const handleEdit = (tx: RecurringTransaction) => {
    setEditingTransaction(tx);
    setIsDialogOpen(true);
  };

  const handleDelete = async (tx: RecurringTransaction) => {
    if (confirm(`Are you sure you want to delete ${tx.name}?`)) {
      const res = await deleteAction(tx.systemId, tx.etag);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success('Deleted successfully');
      }
    }
  };

  const handleRunEngine = async () => {
    setIsEngineRunning(true);
    toast.info('Running recurring engine...');
    const res = await runEngineAction();
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success('Engine ran successfully');
    }
    setIsEngineRunning(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Recurring Transactions</h2>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleRunEngine} disabled={isEngineRunning}>
            <Play className="mr-2 h-4 w-4" />
            {isEngineRunning ? 'Running...' : 'Run Engine'}
          </Button>
          <Button onClick={handleOpenNew}>
            <Plus className="mr-2 h-4 w-4" />
            New Schedule
          </Button>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Account</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Next Run Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                  No recurring transactions found.
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((tx) => (
                <TableRow key={tx.systemId}>
                  <TableCell className="font-medium">{tx.name}</TableCell>
                  <TableCell>{tx.accountCode}</TableCell>
                  <TableCell>{tx.categoryCode}</TableCell>
                  <TableCell>
                    {tx.interval > 1 ? `Every ${tx.interval} ${tx.frequency.replace('ly', 's')}` : tx.frequency}
                  </TableCell>
                  <TableCell>
                    {tx.nextRunDate ? format(new Date(tx.nextRunDate), 'dd MMM yyyy') : '-'}
                  </TableCell>
                  <TableCell className={`text-right font-medium ${tx.transactionType === 'Expense' ? 'text-destructive' : 'text-emerald-500'}`}>
                    {tx.transactionType === 'Expense' ? '-' : '+'}₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={tx.active ? 'default' : 'secondary'}>
                      {tx.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(tx)}>
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(tx)}>
                          <Trash className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <RecurringTransactionDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        initialData={editingTransaction}
        accounts={accounts}
        categories={categories}
        ownerEntraObjectId={ownerEntraObjectId}
        createAction={createAction}
        updateAction={updateAction}
      />
    </div>
  );
}
