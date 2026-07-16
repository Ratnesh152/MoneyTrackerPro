import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoanDashboardSummary } from '@/types/dashboard.types';
import { Landmark, AlertCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export function LoanSummaryCard({ data }: { data: LoanDashboardSummary }) {
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
        <CardTitle className="text-sm font-medium">Loans Overview</CardTitle>
        <Landmark className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatCurrency(data.outstandingPrincipal)}</div>
        <p className="text-xs text-muted-foreground mt-1">Across {data.activeLoansCount} active loan(s)</p>
        
        <div className="mt-4 pt-4 border-t border-border flex justify-between items-center text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Next EMI</p>
            <p className="font-medium">{data.nextEmiAmount ? formatCurrency(data.nextEmiAmount) : '-'}</p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground text-xs">Due Date</p>
            <p className="font-medium">{data.nextEmiDate ? format(parseISO(data.nextEmiDate), 'dd MMM') : '-'}</p>
          </div>
        </div>

        {data.loanHealth === 'Critical' && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-destructive font-medium bg-destructive/10 p-2 rounded-md">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>Missed EMIs detected</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
