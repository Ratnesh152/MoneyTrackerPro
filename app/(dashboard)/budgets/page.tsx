import { Metadata } from 'next';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { budgetAnalyticsService } from '@/services/budget-analytics.service';
import { getCategories } from '@/services/business-central/category.service';
import { AddBudgetButton } from '@/components/features/budgets/AddBudgetButton';
import { BudgetTable } from '@/components/features/budgets/BudgetTable';
import { DashboardCard } from '@/components/shared/DashboardCard';

export const metadata: Metadata = {
  title: 'Budgets - MoneyTracker Pro',
  description: 'Manage your monthly budgets',
};

export default async function BudgetsPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/login');
  }

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  let dashboardData;
  let categoriesData;
  let error = null;

  try {
    const [budgetData, categoriesResponse] = await Promise.all([
      budgetAnalyticsService.getBudgetDashboardData(session.user.id, currentMonth, currentYear),
      getCategories(session.user.id, { top: 500 }) // Fetch categories for the form
    ]);
    
    dashboardData = budgetData;
    categoriesData = categoriesResponse.value;
  } catch (e) {
    console.error('Failed to load budgets:', e);
    error = e;
  }

  if (error || !dashboardData) {
    return (
      <div className="flex-1 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2 mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Budgets</h2>
        </div>
        <div className="p-4 border rounded-md bg-destructive/10 text-destructive">
          Failed to load budgets. Please check your connection to Business Central.
        </div>
      </div>
    );
  }

  const { budgets, summary } = dashboardData;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Budgets</h2>
        <div className="flex items-center space-x-2">
          <AddBudgetButton categories={categoriesData || []} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard title="Total Monthly Budget" className="p-0">
          <div className="text-2xl font-bold">{formatCurrency(summary.monthlyBudget)}</div>
        </DashboardCard>
        
        <DashboardCard title="Total Spent" className="p-0">
          <div className="text-2xl font-bold text-muted-foreground">{formatCurrency(summary.spent)}</div>
        </DashboardCard>
        
        <DashboardCard title="Total Remaining" className="p-0">
          <div className={`text-2xl font-bold ${summary.remaining < 0 ? 'text-red-500' : ''}`}>
            {formatCurrency(summary.remaining)}
          </div>
        </DashboardCard>
        
        <DashboardCard title="Overall Utilization" className="p-0">
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold">{summary.utilizationPercentage}%</div>
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
              <div 
                className={`h-full ${summary.utilizationPercentage >= 100 ? 'bg-red-500' : summary.utilizationPercentage >= 80 ? 'bg-amber-500' : 'bg-green-500'}`} 
                style={{ width: `${Math.min(summary.utilizationPercentage, 100)}%` }}
              />
            </div>
          </div>
        </DashboardCard>
      </div>

      <div className="space-y-4 mt-6">
        <BudgetTable budgets={budgets} categories={categoriesData || []} />
      </div>
    </div>
  );
}
