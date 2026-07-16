import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NetWorthSummary } from '@/types/dashboard.types';
import { ArrowUpRight, ArrowDownRight, IndianRupee } from 'lucide-react';

export function DashboardNetWorthCard({ data }: { data: NetWorthSummary }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="col-span-full md:col-span-2 lg:col-span-3 bg-primary text-primary-foreground border-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium opacity-80">Total Net Worth</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold mb-4">{formatCurrency(data.total)}</div>
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/20 rounded-full">
              <ArrowUpRight className="h-4 w-4" />
            </div>
            <div>
              <p className="opacity-80 text-xs">Assets</p>
              <p className="font-semibold">{formatCurrency(data.assets)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/20 rounded-full">
              <ArrowDownRight className="h-4 w-4" />
            </div>
            <div>
              <p className="opacity-80 text-xs">Liabilities</p>
              <p className="font-semibold">{formatCurrency(data.liabilities)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
