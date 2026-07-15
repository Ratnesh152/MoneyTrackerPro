'use client';

import { CreditCard } from 'lucide-react';

export function CreditCardEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border rounded-md bg-muted/20">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <CreditCard className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">No credit cards found</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm">
        You haven't added any credit cards yet. Add your first credit card to start tracking your liabilities, statement cycles, and spending limits.
      </p>
    </div>
  );
}
