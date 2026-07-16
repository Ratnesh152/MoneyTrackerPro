import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCardDashboardSummary } from '@/types/dashboard.types';
import { CreditCard, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export function CreditCardSummaryCard({ data }: { data: CreditCardDashboardSummary }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  let progressColor = 'bg-primary';
  if (data.utilizationPercentage > 80) progressColor = 'bg-destructive';
  else if (data.utilizationPercentage > 50) progressColor = 'bg-amber-500';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Credit Cards</CardTitle>
        <CreditCard className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatCurrency(data.outstandingBalance)}</div>
        <p className="text-xs text-muted-foreground mt-1">Outstanding Balance</p>
        
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-xs">
            <span>Utilization</span>
            <span className="font-medium">{data.utilizationPercentage.toFixed(0)}%</span>
          </div>
          <Progress value={Math.min(data.utilizationPercentage, 100)} className="h-2" indicatorClassName={progressColor} />
        </div>

        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground flex justify-between">
            <span>Available Credit:</span>
            <span className="font-medium text-foreground">{formatCurrency(data.availableCredit)}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
