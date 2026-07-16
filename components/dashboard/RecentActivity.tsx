import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RecentActivityItem } from '@/types/dashboard.types';
import { ArrowDownRight, ArrowUpRight, Landmark } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export function RecentActivity({ items }: { items: RecentActivityItem[] }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getIcon = (item: RecentActivityItem) => {
    if (item.type === 'LoanPayment') return <Landmark className="h-4 w-4 text-primary" />;
    if (item.status === 'Income') return <ArrowUpRight className="h-4 w-4 text-emerald-500" />;
    return <ArrowDownRight className="h-4 w-4 text-rose-500" />;
  };

  return (
    <Card className="col-span-full md:col-span-1 h-full">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
        <CardDescription>Latest transactions and payments</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-sm">No recent activity found.</div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-full">
                    {getIcon(item)}
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-none mb-1">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(parseISO(item.date), 'dd MMM yyyy')}
                    </p>
                  </div>
                </div>
                <div className={`text-sm font-semibold ${item.status === 'Income' ? 'text-emerald-500' : ''}`}>
                  {item.status === 'Income' ? '+' : '-'}{formatCurrency(item.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
