import React from 'react';
import { auth } from '@/auth';
import { getDashboardAnalytics, DateRangeFilter } from '@/services/dashboard-analytics.service';
import { DashboardNetWorthCard } from '@/components/dashboard/DashboardNetWorthCard';
import { CashFlowCard } from '@/components/dashboard/CashFlowCard';
import { BudgetHealthCard } from '@/components/dashboard/BudgetHealthCard';
import { LoanSummaryCard } from '@/components/dashboard/LoanSummaryCard';
import { CreditCardSummaryCard } from '@/components/dashboard/CreditCardSummaryCard';
import { AccountSummaryCard } from '@/components/dashboard/AccountSummaryCard';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { UpcomingItems } from '@/components/dashboard/UpcomingItems';
import { FinancialHealthScore } from '@/components/dashboard/FinancialHealthScore';
import { DashboardCharts } from '@/components/dashboard/DashboardCharts';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { DashboardFilter } from '@/components/dashboard/DashboardFilter';
import { redirect } from 'next/navigation';

export default async function DashboardPage({
  searchParams
}: {
  searchParams: { range?: string }
}) {
  const session = await auth();
  const ownerOid = session?.user?.id;
  
  if (!ownerOid) {
    redirect('/login');
  }

  const range = (searchParams.range as DateRangeFilter) || 'current_month';
  const dashboardData = await getDashboardAnalytics(ownerOid, range);

  return (
    <div className="flex flex-col space-y-6 max-w-[1600px] mx-auto w-full pb-10">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Welcome back, {session?.user?.name?.split(' ')[0] || 'User'}
          </h2>
          <p className="text-muted-foreground mt-1">
            Here's your financial command center.
          </p>
        </div>
        <DashboardFilter />
      </div>

      {dashboardData.isEmpty ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-card text-card-foreground shadow-sm">
          <div className="rounded-full bg-primary/10 p-4 mb-4">
            <span className="text-primary font-bold text-xl">₹</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">No Financial Data Yet</h3>
          <p className="text-muted-foreground max-w-sm mb-6">
            Get started by adding your first account, recording a transaction, or creating a budget to see your dashboard come alive.
          </p>
        </div>
      ) : (
        <>
          {/* Top Level KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <DashboardNetWorthCard data={dashboardData.netWorth} />
            <FinancialHealthScore data={dashboardData.financialHealth} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <CashFlowCard data={dashboardData.cashFlow} />
            <AccountSummaryCard data={dashboardData.accountSummary} />
            <BudgetHealthCard data={dashboardData.budgetHealth} />
            <LoanSummaryCard data={dashboardData.loanSummary} />
            <CreditCardSummaryCard data={dashboardData.creditCardSummary} />
          </div>

          {/* Activity and Actions Row */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-2">
              <RecentActivity items={dashboardData.recentActivity} />
            </div>
            <div className="lg:col-span-1">
              <UpcomingItems items={dashboardData.upcomingItems} />
            </div>
            <div className="lg:col-span-1">
              <QuickActions />
            </div>
          </div>

          {/* Charts Row */}
          <DashboardCharts data={dashboardData.charts} />
        </>
      )}
    </div>
  );
}
