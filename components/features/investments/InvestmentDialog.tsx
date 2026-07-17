"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Investment } from '@/types/investment.types';
import { InvestmentForm } from './InvestmentForm';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface InvestmentDialogProps {
  investment?: Investment;
  trigger?: React.ReactElement;
}

export function InvestmentDialog({ investment, trigger }: InvestmentDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger render={trigger} />
      ) : (
        <DialogTrigger render={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Investment
          </Button>
        } />
      )}
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{investment ? 'Edit Investment' : 'Create Investment'}</DialogTitle>
        </DialogHeader>
        <InvestmentForm
          investment={investment}
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
