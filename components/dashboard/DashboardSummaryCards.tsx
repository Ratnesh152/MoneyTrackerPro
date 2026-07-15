import React from 'react';
import { SummaryCard } from '../shared/SummaryCard';
import { formatCurrency } from '@/utils/currency';
import { DashboardSummary } from '@/types/dashboard.types';
import { Wallet, TrendingUp, TrendingDown, Building, ReceiptText, Grid } from 'lucide-react';

interface DashboardSummaryCardsProps {
  summary: DashboardSummary;
}

export function DashboardSummaryCards({ summary }: DashboardSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <SummaryCard
        title="Net Worth"
        amount={formatCurrency(summary.netWorth)}
        icon={<Wallet className="h-4 w-4 text-blue-500" />}
      />
      <SummaryCard
        title="Monthly Income"
        amount={formatCurrency(summary.monthlyIncome)}
        icon={<TrendingUp className="h-4 w-4 text-emerald-500" />}
      />
      <SummaryCard
        title="Monthly Expense"
        amount={formatCurrency(summary.monthlyExpense)}
        icon={<TrendingDown className="h-4 w-4 text-rose-500" />}
      />
      <SummaryCard
        title="Accounts"
        amount={summary.totalAccounts.toString()}
        icon={<Building className="h-4 w-4 text-purple-500" />}
      />
      <SummaryCard
        title="Transactions"
        amount={summary.totalTransactions.toString()}
        icon={<ReceiptText className="h-4 w-4 text-orange-500" />}
      />
      <SummaryCard
        title="Categories"
        amount={summary.totalCategories.toString()}
        icon={<Grid className="h-4 w-4 text-cyan-500" />}
      />
    </div>
  );
}
