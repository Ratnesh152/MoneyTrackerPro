import type { LoanAnalytics } from '@/types/loan-analytics.types';
import { Card, CardContent } from '@/components/ui/card';
import {
  ArrowDownRight,
  CalendarCheck,
  Clock,
  IndianRupee,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

interface LoanAnalyticsCardsProps {
  analytics: LoanAnalytics;
}

const fmt = (n: number, currency: string) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency || 'INR',
    maximumFractionDigits: 0,
  }).format(n);

const fmtDate = (d: string | null) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

interface KPICardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}

function KPICard({ icon, label, value, sub, accent = 'text-foreground' }: KPICardProps) {
  return (
    <Card className="border shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="flex flex-col gap-3 p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            {icon}
          </div>
        </div>
        <div>
          <p className={`text-2xl font-bold ${accent}`}>{value}</p>
          {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export function LoanAnalyticsCards({ analytics }: LoanAnalyticsCardsProps) {
  const { loan, outstandingPrincipal, totalInterest, interestPaid,
          progressPercent, remainingMonths, nextEMIDate } = analytics;
  const currency = loan.currencyCode || 'INR';

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      <KPICard
        icon={<TrendingDown className="h-4 w-4" />}
        label="Outstanding"
        value={fmt(outstandingPrincipal, currency)}
        sub="Principal balance"
        accent="text-rose-600 dark:text-rose-400"
      />
      <KPICard
        icon={<IndianRupee className="h-4 w-4" />}
        label="Total Interest"
        value={fmt(totalInterest, currency)}
        sub={`${((totalInterest / (loan.principalAmount + totalInterest)) * 100).toFixed(1)}% of total payable`}
        accent="text-amber-600 dark:text-amber-400"
      />
      <KPICard
        icon={<ArrowDownRight className="h-4 w-4" />}
        label="Interest Paid"
        value={fmt(interestPaid, currency)}
        sub="So far"
      />
      <KPICard
        icon={<TrendingUp className="h-4 w-4" />}
        label="Progress"
        value={`${progressPercent.toFixed(1)}%`}
        sub={`${analytics.monthsElapsed} of ${loan.tenureMonths} EMIs`}
        accent="text-emerald-600 dark:text-emerald-400"
      />
      <KPICard
        icon={<Clock className="h-4 w-4" />}
        label="Remaining"
        value={remainingMonths === 0 ? 'Completed' : `${remainingMonths} mo`}
        sub={remainingMonths > 0 ? `≈ ${(remainingMonths / 12).toFixed(1)} years` : undefined}
      />
      <KPICard
        icon={<CalendarCheck className="h-4 w-4" />}
        label="Next EMI"
        value={fmtDate(nextEMIDate)}
        sub={nextEMIDate ? `${fmt(loan.emiAmount, currency)}` : 'Loan closed'}
      />
    </div>
  );
}
