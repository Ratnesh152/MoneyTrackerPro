'use client';

import { useState } from 'react';
import { CreditCard } from '@/types/credit-card.types';
import { deleteCreditCardAction } from '@/app/(dashboard)/credit-cards/actions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

interface DeleteCreditCardDialogProps {
  creditCard: CreditCard | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteCreditCardDialog({ creditCard, open, onOpenChange }: DeleteCreditCardDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!creditCard) return;

    setIsDeleting(true);
    setError(null);

    try {
      const result = await deleteCreditCardAction(creditCard.systemId, creditCard.etag);
      if (result.success) {
        onOpenChange(false);
      } else {
        setError(result.error || 'Failed to delete credit card.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Credit Card</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{creditCard?.cardName}</strong> ({creditCard?.issuingBank} •••• {creditCard?.last4Digits})? 
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md mx-6">
            {error}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
