import type { LoanAnalytics } from '@/types/loan-analytics.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LoanProgressProps {
  analytics: LoanAnalytics;
}

const fmt = (n: number, currency: string) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency || 'INR',
    maximumFractionDigits: 0,
  }).format(n);

export function LoanProgress({ analytics }: LoanProgressProps) {
  const { loan, principalPaid, interestPaid, outstandingPrincipal,
          remainingInterest, progressPercent, totalPayable } = analytics;
  const currency = loan.currencyCode || 'INR';

  const principalPaidPct = (principalPaid / totalPayable) * 100;
  const interestPaidPct  = (interestPaid  / totalPayable) * 100;

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Repayment Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">

        {/* Segmented Progress Bar */}
        <div className="space-y-2">
          <div className="flex h-4 w-full overflow-hidden rounded-full bg-muted">
            {/* Principal Paid — blue */}
            <div
              className="flex items-center justify-center bg-blue-500 transition-all duration-700"
              style={{ width: `${principalPaidPct}%` }}
            />
            {/* Interest Paid — amber */}
            <div
              className="flex items-center justify-center bg-amber-400 transition-all duration-700"
              style={{ width: `${interestPaidPct}%` }}
            />
            {/* Remaining — muted */}
          </div>
          <div className="flex items-center justify-between text-sm font-semibold">
            <span className="text-muted-foreground">₹0</span>
            <span>{progressPercent.toFixed(1)}% repaid</span>
            <span className="text-muted-foreground">{fmt(totalPayable, currency)}</span>
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <LegendItem color="bg-blue-500" label="Principal Paid" value={fmt(principalPaid, currency)} />
          <LegendItem color="bg-amber-400" label="Interest Paid" value={fmt(interestPaid, currency)} />
          <LegendItem color="bg-rose-500" label="Outstanding Principal" value={fmt(outstandingPrincipal, currency)} />
          <LegendItem color="bg-muted-foreground/30" label="Remaining Interest" value={fmt(remainingInterest, currency)} />
        </div>

        {/* Completion label */}
        {loan.status === 'Closed' && (
          <div className="rounded-lg bg-emerald-50 px-4 py-3 text-center text-sm font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
            🎉 This loan has been fully repaid!
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface LegendItemProps {
  color: string;
  label: string;
  value: string;
}

function LegendItem({ color, label, value }: LegendItemProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${color}`} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <span className="pl-4 text-sm font-semibold">{value}</span>
    </div>
  );
}
