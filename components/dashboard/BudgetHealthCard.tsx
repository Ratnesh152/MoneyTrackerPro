import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BudgetHealthSummary } from '@/types/dashboard.types';
import { PieChart } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export function BudgetHealthCard({ data }: { data: BudgetHealthSummary }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const utilization = data.totalBudget > 0 ? (data.totalUsed / data.totalBudget) * 100 : 0;
  
  let progressColor = 'bg-primary';
  if (utilization > 100) progressColor = 'bg-destructive';
  else if (utilization > 85) progressColor = 'bg-amber-500';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Budget Health</CardTitle>
        <PieChart className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatCurrency(data.totalRemaining)}</div>
        <p className="text-xs text-muted-foreground mt-1">Remaining of {formatCurrency(data.totalBudget)}</p>
        
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-xs">
            <span>Utilization</span>
            <span className="font-medium">{utilization.toFixed(0)}%</span>
          </div>
          <Progress value={Math.min(utilization, 100)} className="h-2" indicatorClassName={progressColor} />
        </div>

        {data.overspentCategoriesCount > 0 && (
          <p className="text-xs text-destructive mt-3 font-medium">
            {data.overspentCategoriesCount} {data.overspentCategoriesCount === 1 ? 'category' : 'categories'} overspent
          </p>
        )}
      </CardContent>
    </Card>
  );
}
