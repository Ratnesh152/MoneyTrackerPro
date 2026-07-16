import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CashFlowSummary } from '@/types/dashboard.types';
import { TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';

export function CashFlowCard({ data }: { data: CashFlowSummary }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Cash Flow</CardTitle>
        <PiggyBank className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatCurrency(data.income - data.expense)}</div>
        <p className="text-xs text-muted-foreground mt-1">
          Savings Rate: <span className="font-medium text-foreground">{data.savingsRate.toFixed(1)}%</span>
        </p>
        <div className="mt-4 flex gap-4 text-sm">
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-emerald-500" /> Income
            </span>
            <span className="font-medium">{formatCurrency(data.income)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs flex items-center gap-1">
              <TrendingDown className="h-3 w-3 text-rose-500" /> Expense
            </span>
            <span className="font-medium">{formatCurrency(data.expense)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
