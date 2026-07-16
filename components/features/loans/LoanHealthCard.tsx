import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, AlertTriangle, XCircle, CheckCircle2 } from 'lucide-react';

interface LoanHealthCardProps {
  health: 'Healthy' | 'Warning' | 'Critical';
  daysPastDue: number;
  overdueAmount: number;
  currencyCode: string;
}

const fmt = (n: number, currency: string) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency || 'INR',
    maximumFractionDigits: 0,
  }).format(n);

export function LoanHealthCard({ health, daysPastDue, overdueAmount, currencyCode }: LoanHealthCardProps) {
  
  const isHealthy = health === 'Healthy';
  const isWarning = health === 'Warning';
  
  const Icon = isHealthy ? CheckCircle2 : (isWarning ? AlertTriangle : XCircle);
  const colorClass = isHealthy ? 'text-emerald-500' : (isWarning ? 'text-amber-500' : 'text-destructive');
  const bgClass = isHealthy ? 'bg-emerald-50 dark:bg-emerald-950/20' : (isWarning ? 'bg-amber-50 dark:bg-amber-950/20' : 'bg-destructive/10');

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Loan Health</CardTitle>
        <Activity className={`h-4 w-4 ${colorClass}`} />
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <div className={`p-2 rounded-full ${bgClass}`}>
            <Icon className={`h-5 w-5 ${colorClass}`} />
          </div>
          <div>
            <div className={`text-2xl font-bold ${colorClass}`}>{health}</div>
            <p className="text-xs text-muted-foreground">
              {isHealthy ? 'All payments are up to date' : `${daysPastDue} days past due`}
            </p>
          </div>
        </div>
        {!isHealthy && overdueAmount > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="text-sm font-medium text-destructive">
              Overdue Amount: {fmt(overdueAmount, currencyCode)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
