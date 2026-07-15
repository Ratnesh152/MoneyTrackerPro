'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TransactionRow } from './TransactionRow';
import { TransactionForm } from './TransactionForm';
import { DeleteTransactionDialog } from './DeleteTransactionDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Transaction } from '@/types/transaction.types';
import { Account } from '@/types/account.types';
import { Category } from '@/types/category.types';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';

interface TransactionTableProps {
  initialData: {
    value: Transaction[];
    nextLink?: string;
  };
  accounts?: Account[];
  categories?: Category[];
}

export function TransactionTable({ initialData, accounts = [], categories = [] }: TransactionTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);

  const [deleteTx, setDeleteTx] = useState<Transaction | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  useEffect(() => {
    const handleOpenCreate = () => setCreateOpen(true);
    window.addEventListener('open-create-transaction', handleOpenCreate);
    return () => window.removeEventListener('open-create-transaction', handleOpenCreate);
  }, []);

  const handleSort = (field: string) => {
    const currentSort = searchParams.get('sort');
    const params = new URLSearchParams(searchParams.toString());
    
    if (currentSort === `${field}_asc`) {
      params.set('sort', `${field}_desc`);
    } else if (currentSort === `${field}_desc`) {
      params.delete('sort');
    } else {
      params.set('sort', `${field}_asc`);
    }
    
    router.push(`?${params.toString()}`);
  };

  const getSortIcon = (field: string) => {
    const currentSort = searchParams.get('sort');
    if (currentSort === `${field}_asc`) return <ArrowUp className="ml-1 h-4 w-4 inline" />;
    if (currentSort === `${field}_desc`) return <ArrowDown className="ml-1 h-4 w-4 inline" />;
    return <ArrowUpDown className="ml-1 h-4 w-4 inline text-muted-foreground/30" />;
  };

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer whitespace-nowrap" onClick={() => handleSort('transactionDate')}>
                Date {getSortIcon('transactionDate')}
              </TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('categoryCode')}>
                Category {getSortIcon('categoryCode')}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('accountCode')}>
                Account {getSortIcon('accountCode')}
              </TableHead>
              <TableHead className="text-right cursor-pointer whitespace-nowrap" onClick={() => handleSort('amount')}>
                Amount {getSortIcon('amount')}
              </TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialData.value.map((tx) => (
              <TransactionRow 
                key={tx.systemId} 
                transaction={tx} 
                onEdit={() => {
                  setEditTx(tx);
                  setIsEditOpen(true);
                }}
                onDelete={() => {
                  setDeleteTx(tx);
                  setIsDeleteOpen(true);
                }}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Transaction</DialogTitle>
          </DialogHeader>
          <TransactionForm 
            accounts={accounts}
            categories={categories}
            onSuccess={() => setCreateOpen(false)} 
            onCancel={() => setCreateOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
          </DialogHeader>
          <TransactionForm 
            accounts={accounts}
            categories={categories}
            initialData={editTx} 
            onSuccess={() => setIsEditOpen(false)} 
            onCancel={() => setIsEditOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      <DeleteTransactionDialog
        transaction={deleteTx}
        isOpen={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
      />
    </>
  );
}
