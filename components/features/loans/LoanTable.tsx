'use client';

import { useState } from 'react';
import { Loan } from '@/types/loan.types';
import { LoanRow } from './LoanRow';
import { LoanForm } from './LoanForm';
import { DeleteLoanDialog } from './DeleteLoanDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface LoanTableProps {
  loans: Loan[];
}

export function LoanTable({ loans }: LoanTableProps) {
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const [deletingLoan, setDeletingLoan] = useState<Loan | null>(null);

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Loan Info</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Principal</TableHead>
              <TableHead className="text-right">Interest Rate</TableHead>
              <TableHead className="text-right">Tenure</TableHead>
              <TableHead className="text-right">EMI</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loans.map((loan) => (
              <LoanRow
                key={loan.systemId}
                loan={loan}
                onEdit={setEditingLoan}
                onDelete={setDeletingLoan}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editingLoan} onOpenChange={(open) => !open && setEditingLoan(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Loan</DialogTitle>
          </DialogHeader>
          <LoanForm
            initialData={editingLoan || undefined}
            onSuccess={() => setEditingLoan(null)}
          />
        </DialogContent>
      </Dialog>

      <DeleteLoanDialog
        loan={deletingLoan}
        open={!!deletingLoan}
        onOpenChange={(open) => !open && setDeletingLoan(null)}
      />
    </>
  );
}
