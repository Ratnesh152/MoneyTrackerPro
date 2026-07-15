import React from 'react';
import { DashboardCard } from '../shared/DashboardCard';
import { DashboardAccountSummary } from '@/types/dashboard.types';
import { formatCurrency } from '@/utils/currency';
import { Building, Wallet, CreditCard } from 'lucide-react';

interface AccountsOverviewProps {
  accounts: DashboardAccountSummary[];
}

export function AccountsOverview({ accounts }: AccountsOverviewProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'Bank': return <Building className="h-4 w-4" />;
      case 'Wallet': return <Wallet className="h-4 w-4" />;
      case 'Cash': return <CreditCard className="h-4 w-4" />;
      default: return <Building className="h-4 w-4" />;
    }
  };

  return (
    <DashboardCard title="Accounts" description="Current balances">
      <div className="flex flex-col space-y-4 mt-4">
        {accounts.length === 0 && (
          <div className="text-sm text-muted-foreground text-center py-4">No accounts found</div>
        )}
        {accounts.map((acc, i) => (
          <div key={i} className="flex items-center justify-between p-3 border rounded-md bg-card hover:bg-muted/20 transition-colors">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-full text-primary">
                {getIcon(acc.type)}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">{acc.name}</span>
                <span className="text-xs text-muted-foreground">{acc.type}</span>
              </div>
            </div>
            <div className="font-semibold">{formatCurrency(acc.balance)}</div>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}
