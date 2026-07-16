import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarClock, CheckCircle } from 'lucide-react';
import { differenceInDays, parseISO, isPast, isToday } from 'date-fns';

interface UpcomingEMICardProps {
  nextEmiDate: string | null;
  emiAmount: number;
  currencyCode: string;
  isClosed?: boolean;
}

const fmt = (n: number, currency: string) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency || 'INR',
    maximumFractionDigits: 0,
  }).format(n);

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

export function UpcomingEMICard({ nextEmiDate, emiAmount, currencyCode, isClosed }: UpcomingEMICardProps) {
  
  if (isClosed || !nextEmiDate) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Upcoming EMI</CardTitle>
          <CheckCircle className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-500">Fully Paid</div>
          <p className="text-xs text-muted-foreground mt-1">No upcoming payments</p>
        </CardContent>
      </Card>
    );
  }

  const dateObj = parseISO(nextEmiDate);
  const daysDiff = differenceInDays(dateObj, new Date());
  
  let daysText = '';
  let colorClass = 'text-primary';

  if (isToday(dateObj)) {
    daysText = 'Due Today';
    colorClass = 'text-amber-500 font-bold';
  } else if (isPast(dateObj)) {
    daysText = `${Math.abs(daysDiff)} days overdue`;
    colorClass = 'text-destructive font-bold';
  } else if (daysDiff === 1) {
    daysText = 'Due Tomorrow';
    colorClass = 'text-amber-500';
  } else {
    daysText = `Due in ${daysDiff} days`;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Upcoming EMI</CardTitle>
        <CalendarClock className={`h-4 w-4 ${colorClass}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{fmt(emiAmount, currencyCode)}</div>
        <div className="flex flex-col mt-1">
          <span className="text-sm font-medium">{fmtDate(nextEmiDate)}</span>
          <span className={`text-xs ${colorClass}`}>{daysText}</span>
        </div>
      </CardContent>
    </Card>
  );
}
