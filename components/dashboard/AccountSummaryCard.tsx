import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AccountDashboardSummary } from '@/types/dashboard.types';
import { Wallet, Building2, Coins } from 'lucide-react';

export function AccountSummaryCard({ data }: { data: AccountDashboardSummary }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const total = data.totalCash + data.bankBalance + data.walletBalance;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Liquid Assets</CardTitle>
        <Wallet className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatCurrency(total)}</div>
        <p className="text-xs text-muted-foreground mt-1">Total Available Balance</p>
        
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span>Bank</span>
            </div>
            <span className="font-medium">{formatCurrency(data.bankBalance)}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Wallet className="h-4 w-4" />
              <span>Wallet</span>
            </div>
            <span className="font-medium">{formatCurrency(data.walletBalance)}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Coins className="h-4 w-4" />
              <span>Cash</span>
            </div>
            <span className="font-medium">{formatCurrency(data.totalCash)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
