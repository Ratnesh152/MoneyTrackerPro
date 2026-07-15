'use client';

import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Account } from '@/types/account.types';
import { Category } from '@/types/category.types';

export function TransactionEmptyState({ accounts = [], categories = [] }: { accounts?: Account[], categories?: Category[] }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center border rounded-lg bg-muted/10 border-dashed">
      <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-primary/10">
        <PlusCircle className="w-6 h-6 text-primary" />
      </div>
      <h3 className="text-lg font-semibold tracking-tight">No transactions</h3>
      <p className="mb-8 mt-2 text-center text-sm font-normal leading-6 text-muted-foreground max-w-sm">
        You haven&apos;t added any transactions yet. Add your first income or expense to start tracking your money.
      </p>
      {accounts.length === 0 || categories.length === 0 ? (
        <p className="text-sm text-amber-600 font-medium">Please create at least one Account and one Category first.</p>
      ) : (
        <Button size="lg" onClick={() => window.dispatchEvent(new Event('open-create-transaction'))}>
          Create Transaction
        </Button>
      )}
    </div>
  );
}
