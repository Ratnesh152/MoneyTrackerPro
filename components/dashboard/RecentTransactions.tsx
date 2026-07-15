import React from 'react';
import { DashboardCard } from '../shared/DashboardCard';
import { Transaction } from '@/types/transaction.types';
import { formatCurrency } from '@/utils/currency';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <DashboardCard title="Recent Transactions" description="Your latest activity">
      <div className="flex flex-col space-y-3 mt-4">
        {transactions.length === 0 && (
          <div className="text-sm text-muted-foreground text-center py-4">No transactions found</div>
        )}
        {transactions.map((t, i) => {
          const isIncome = t.transactionType === 'Income';
          return (
            <div key={i} className="flex items-center justify-between p-3 border-b last:border-0 hover:bg-muted/20 transition-colors rounded-md">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${isIncome ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                  {isIncome ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold truncate max-w-[150px] sm:max-w-[200px]">{t.description}</span>
                  <span className="text-xs text-muted-foreground">{t.categoryName || t.categoryCode} • {new Date(t.transactionDate).toLocaleDateString()}</span>
                </div>
              </div>
              <div className={`font-semibold ${isIncome ? 'text-emerald-500' : 'text-foreground'}`}>
                {isIncome ? '+' : '-'}{formatCurrency(t.amount)}
              </div>
            </div>
          );
        })}
      </div>
    </DashboardCard>
  );
}
