import React from 'react';
import { auth } from '@/auth';
import { getCompanies, getEnvironmentInfo } from '@/services/business-central/system.service';
import { getDashboardData } from '@/services/dashboard.service';
import { formatCurrentMonth } from '@/utils/date';
import { Building, Server } from 'lucide-react';
import { DashboardCard } from '@/components/shared/DashboardCard';
import { DashboardSummaryCards } from '@/components/dashboard/DashboardSummaryCards';
import { IncomeExpenseChart } from '@/components/dashboard/IncomeExpenseChart';
import { ExpenseCategoryChart } from '@/components/dashboard/ExpenseCategoryChart';
import { CashFlowChart } from '@/components/dashboard/CashFlowChart';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { AccountsOverview } from '@/components/dashboard/AccountsOverview';
import { QuickActions } from '@/components/dashboard/QuickActions';

import { BudgetSummaryWidget } from '@/components/dashboard/BudgetSummaryWidget';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await auth();
  const ownerOid = session?.user?.id;
  
  if (!ownerOid) {
    redirect('/login');
  }

  const [companies, environment, dashboardData] = await Promise.all([
    getCompanies(),
    getEnvironmentInfo(),
    getDashboardData(ownerOid)
  ]);

  const currentCompany = companies.length > 0 ? companies[0] : null;

  return (
    <div className="flex flex-col space-y-6">
      {/* Welcome & System Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DashboardCard className="md:col-span-2 bg-gradient-to-br from-primary/10 via-background to-background">
          <div className="flex flex-col h-full justify-center">
            <h2 className="text-3xl font-bold tracking-tight mb-2">
              Welcome back, {session?.user?.name?.split(' ')[0] || 'User'}!
            </h2>
            <p className="text-muted-foreground">
              Here&apos;s a summary of your financial overview for {formatCurrentMonth()}.
            </p>
          </div>
        </DashboardCard>

        <DashboardCard>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-md text-primary">
                <Building className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Company</span>
                <span className="text-sm font-semibold truncate" title={currentCompany?.displayName || currentCompany?.name || 'Unknown'}>
                  {currentCompany?.displayName || currentCompany?.name || 'Loading...'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-md text-primary">
                <Server className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Environment</span>
                <span className="text-sm font-semibold truncate">
                  {environment.environmentName} (v{environment.version})
                </span>
              </div>
            </div>
          </div>
        </DashboardCard>
      </div>

      {/* Summary Cards */}
      <DashboardSummaryCards summary={dashboardData.summary} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Charts and Overview) - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          <IncomeExpenseChart data={dashboardData.charts.incomeVsExpense} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CashFlowChart data={dashboardData.charts.cashFlow} />
            <ExpenseCategoryChart data={dashboardData.charts.expenseCategories} />
          </div>

          <RecentTransactions transactions={dashboardData.recentTransactions} />
        </div>

        {/* Right Column (Widgets) - 1/3 width */}
        <div className="space-y-6">
          <QuickActions />
          <BudgetSummaryWidget budgetData={dashboardData.budgetAnalytics} />
          <AccountsOverview accounts={dashboardData.accountsOverview} />
        </div>

      </div>
    </div>
  );
}
