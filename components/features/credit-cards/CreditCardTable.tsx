'use client';

import { useState } from 'react';
import { CreditCard } from '@/types/credit-card.types';
import { CreditCardRow } from './CreditCardRow';
import { CreditCardForm } from './CreditCardForm';
import { DeleteCreditCardDialog } from './DeleteCreditCardDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface CreditCardTableProps {
  creditCards: CreditCard[];
}

export function CreditCardTable({ creditCards }: CreditCardTableProps) {
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);
  const [deletingCard, setDeletingCard] = useState<CreditCard | null>(null);

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Card Info</TableHead>
              <TableHead>Network</TableHead>
              <TableHead className="text-right">Credit Limit</TableHead>
              <TableHead className="text-center">Stmt Day</TableHead>
              <TableHead className="text-center">Due Day</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {creditCards.map((card) => (
              <CreditCardRow
                key={card.systemId}
                creditCard={card}
                onEdit={setEditingCard}
                onDelete={setDeletingCard}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editingCard} onOpenChange={(open) => !open && setEditingCard(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Credit Card</DialogTitle>
          </DialogHeader>
          <CreditCardForm
            initialData={editingCard || undefined}
            onSuccess={() => setEditingCard(null)}
          />
        </DialogContent>
      </Dialog>

      <DeleteCreditCardDialog
        creditCard={deletingCard}
        open={!!deletingCard}
        onOpenChange={(open) => !open && setDeletingCard(null)}
      />
    </>
  );
}
