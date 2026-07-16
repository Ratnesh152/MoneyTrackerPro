import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/auth';
import { getLoanAnalytics } from '@/services/loan-analytics.service';
import { getLoanPayments } from '@/services/business-central/loan-payment.service';
import { calculateLoanPaymentAnalytics } from '@/services/loan-payment-analytics.service';
import { LoanSummary } from '@/components/features/loans/LoanSummary';
import { LoanAnalyticsCards } from '@/components/features/loans/LoanAnalyticsCards';
import { LoanProgress } from '@/components/features/loans/LoanProgress';
import { LoanCharts } from '@/components/features/loans/LoanCharts';
import { AmortizationTable } from '@/components/features/loans/AmortizationTable';
import { LoanHealthCard } from '@/components/features/loans/LoanHealthCard';
import { UpcomingEMICard } from '@/components/features/loans/UpcomingEMICard';
import { LoanPaymentClientWrapper } from './LoanPaymentClientWrapper';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { calculateEMI } from '@/services/financial-math/emi';

export async function generateMetadata(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  return {
    title: `Loan Details — MoneyTracker Pro`,
    description: `Full amortization schedule and analytics for loan ${id}`,
  };
}

export default async function LoanDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  const session = await auth();
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  let analytics = null;
  let paymentAnalytics = null;
  let error: string | null = null;

  try {
    analytics = await getLoanAnalytics(id, session.user.id);
    if (analytics) {
      const paymentsResponse = await getLoanPayments(session.user.id, { loanSystemId: analytics.loan.systemId });
      paymentAnalytics = calculateLoanPaymentAnalytics(analytics, paymentsResponse.value);
    }
  } catch (err: unknown) {
    error = err instanceof Error ? err.message : 'Failed to load loan details.';
  }

  if (!analytics && !error) {
    notFound();
  }

  // Financial validation: compare stored EMI vs calculated EMI
  const calculatedEMI = analytics
    ? calculateEMI(analytics.loan.principalAmount, analytics.loan.interestRate, analytics.loan.tenureMonths)
    : 0;
  const emiVariance = analytics ? Math.abs(analytics.loan.emiAmount - calculatedEMI) : 0;

  return (
    <div className="flex-1 space-y-6 p-6 pt-4 print:p-4">
      {/* Back Navigation */}
      <div className="flex items-center gap-3 print:hidden">
        <Link
          href="/loans"
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Loans
        </Link>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Unable to load loan details</p>
            <p className="mt-0.5 opacity-80">{error}</p>
          </div>
        </div>
      )}

      {analytics && paymentAnalytics && (
        <>
          {/* EMI Variance Warning */}
          {emiVariance > 5 && (
            <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-400 print:hidden">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                The stored EMI ({analytics.loan.emiAmount.toLocaleString('en-IN')}) differs from the
                calculated formula result ({calculatedEMI.toLocaleString('en-IN')}) by ₹{emiVariance.toFixed(2)}.
                The schedule uses the stored EMI as the source of truth.
              </span>
            </div>
          )}

          {/* Section 1 — Loan Summary */}
          <LoanSummary loan={analytics.loan} />

          {/* New Section — Live Health & Upcoming */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 print:hidden">
            <LoanHealthCard 
              health={paymentAnalytics.loanHealth}
              daysPastDue={paymentAnalytics.daysPastDue}
              overdueAmount={paymentAnalytics.overdueAmount}
              currencyCode={analytics.loan.currencyCode}
            />
            <UpcomingEMICard 
              nextEmiDate={analytics.schedule[paymentAnalytics.currentEMI - 1]?.date || null}
              emiAmount={analytics.loan.emiAmount}
              currencyCode={analytics.loan.currencyCode}
              isClosed={analytics.loan.status === 'Closed'}
            />
            {/* Third column can be outstanding principal highlight */}
            <div className="rounded-xl border bg-card text-card-foreground shadow flex flex-col p-6 justify-center">
               <span className="text-sm font-medium text-muted-foreground">Derived Outstanding Principal</span>
               <span className="text-3xl font-bold mt-2">
                 {new Intl.NumberFormat('en-IN', { style: 'currency', currency: analytics.loan.currencyCode || 'INR', maximumFractionDigits: 0 }).format(paymentAnalytics.outstandingPrincipal)}
               </span>
               <span className="text-xs text-muted-foreground mt-1">Based on actual payments recorded</span>
            </div>
          </div>

          {/* Section 2 — Analytics KPI Cards */}
          <LoanAnalyticsCards analytics={analytics} />

          {/* Section 3 — Repayment Progress */}
          <LoanProgress analytics={analytics} />

          {/* New Section — Payment History */}
          <div className="print:hidden">
            <LoanPaymentClientWrapper 
              history={paymentAnalytics.history}
              currencyCode={analytics.loan.currencyCode}
              defaultEmiNumber={paymentAnalytics.currentEMI}
              defaultAmount={analytics.loan.emiAmount}
              loanSystemId={analytics.loan.systemId}
            />
          </div>

          {/* Section 4 — Charts */}
          <div className="print:hidden">
            <LoanCharts analytics={analytics} />
          </div>

          {/* Section 5 — Amortization Table */}
          <AmortizationTable
            schedule={analytics.schedule}
            loan={analytics.loan}
            currentMonth={analytics.monthsElapsed}
          />
        </>
      )}
    </div>
  );
}
