import type { Loan } from '@/types/loan.types';
import { Card, CardContent } from '@/components/ui/card';
import {
  Building2,
  CalendarDays,
  CreditCard,
  Hash,
  Landmark,
  Percent,
  Timer,
  Wallet,
} from 'lucide-react';

interface LoanSummaryProps {
  loan: Loan;
}

const LOAN_TYPE_COLORS: Record<string, string> = {
  Home: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  Personal: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  Vehicle: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  Education: 'bg-green-500/10 text-green-600 border-green-500/20',
  Business: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
  Gold: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
  Mortgage: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
  Other: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
};

const fmt = (n: number, currency: string) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency || 'INR',
    maximumFractionDigits: 0,
  }).format(n);

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

interface SummaryFieldProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function SummaryField({ icon, label, value }: SummaryFieldProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}

export function LoanSummary({ loan }: LoanSummaryProps) {
  const typeColor = LOAN_TYPE_COLORS[loan.loanType] ?? LOAN_TYPE_COLORS.Other;

  return (
    <Card className="overflow-hidden border-0 shadow-md">
      {/* Header strip */}
      <div className="bg-gradient-to-r from-primary/90 to-primary px-6 py-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-primary-foreground">
              {loan.loanName}
            </h1>
            <p className="mt-0.5 text-sm text-primary-foreground/75">
              {loan.lenderName}
              {loan.loanAccountNumber && (
                <span className="ml-2 opacity-60">· {loan.loanAccountNumber}</span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${typeColor}`}
            >
              {loan.loanType}
            </span>
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
                loan.status === 'Active'
                  ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600'
                  : 'border-gray-500/20 bg-gray-500/10 text-gray-500'
              }`}
            >
              {loan.status}
            </span>
          </div>
        </div>
      </div>

      {/* Details grid */}
      <CardContent className="grid grid-cols-2 gap-x-6 gap-y-4 p-6 sm:grid-cols-3 lg:grid-cols-4">
        <SummaryField
          icon={<Wallet className="h-4 w-4" />}
          label="Principal Amount"
          value={fmt(loan.principalAmount, loan.currencyCode)}
        />
        <SummaryField
          icon={<Percent className="h-4 w-4" />}
          label="Interest Rate"
          value={`${loan.interestRate}% p.a.`}
        />
        <SummaryField
          icon={<Timer className="h-4 w-4" />}
          label="Tenure"
          value={`${loan.tenureMonths} months (${Math.round(loan.tenureMonths / 12 * 10) / 10} yrs)`}
        />
        <SummaryField
          icon={<CreditCard className="h-4 w-4" />}
          label="Monthly EMI"
          value={fmt(loan.emiAmount, loan.currencyCode)}
        />
        <SummaryField
          icon={<CalendarDays className="h-4 w-4" />}
          label="Start Date"
          value={fmtDate(loan.startDate)}
        />
        <SummaryField
          icon={<Landmark className="h-4 w-4" />}
          label="Currency"
          value={loan.currencyCode || 'INR'}
        />
        <SummaryField
          icon={<Building2 className="h-4 w-4" />}
          label="Prepayment"
          value={loan.supportsPrepayment ? 'Allowed' : 'Not Allowed'}
        />
        {loan.notes && (
          <SummaryField
            icon={<Hash className="h-4 w-4" />}
            label="Notes"
            value={loan.notes}
          />
        )}
      </CardContent>
    </Card>
  );
}
