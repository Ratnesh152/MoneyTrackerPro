import React from 'react';
import { DashboardCard } from '../shared/DashboardCard';
import { BudgetDashboardData } from '@/services/budget-analytics.service';
import { PieChart } from 'lucide-react';
import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';

interface BudgetSummaryWidgetProps {
  budgetData?: BudgetDashboardData;
}

export function BudgetSummaryWidget({ budgetData }: BudgetSummaryWidgetProps) {
  if (!budgetData || budgetData.budgets.length === 0) {
    return (
      <DashboardCard 
        title="Monthly Budget" 
        action={<PieChart className="h-5 w-5 text-muted-foreground" />}
      >
        <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            No budgets set for this month.
          </p>
          <Link 
            href="/budgets" 
            className={buttonVariants({ variant: 'outline', size: 'sm' })}
          >
            Create Budget
          </Link>
        </div>
      </DashboardCard>
    );
  }

  const { summary, topOverspent } = budgetData;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <DashboardCard 
      title="Budget Summary" 
      action={<PieChart className="h-5 w-5 text-muted-foreground" />}
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Overall Budget</span>
            <span className="font-medium">{formatCurrency(summary.monthlyBudget)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Spent</span>
            <span className="font-medium">{formatCurrency(summary.spent)}</span>
          </div>
          <div className="flex justify-between text-sm font-semibold pt-2 border-t">
            <span>Remaining</span>
            <span className={summary.remaining < 0 ? 'text-red-500' : 'text-green-500'}>
              {formatCurrency(summary.remaining)}
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Utilization</span>
            <span className="font-medium">{summary.utilizationPercentage}%</span>
          </div>
          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
            <div 
              className={`h-full ${summary.utilizationPercentage >= 100 ? 'bg-red-500' : summary.utilizationPercentage >= 80 ? 'bg-amber-500' : 'bg-green-500'}`} 
              style={{ width: `${Math.min(summary.utilizationPercentage, 100)}%` }}
            />
          </div>
        </div>

        {topOverspent.length > 0 && (
          <div className="pt-4 border-t">
            <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-3 tracking-wider">
              Overspent Categories
            </h4>
            <div className="space-y-3">
              {topOverspent.map(b => (
                <div key={b.systemId} className="flex flex-col space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium truncate">{b.categoryName}</span>
                    <span className="text-red-500 font-medium">
                      {formatCurrency(Math.abs(b.remainingAmount))} over
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-500" 
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Link 
          href="/budgets" 
          className={buttonVariants({ variant: 'ghost', className: 'w-full text-xs' })}
        >
          View All Budgets
        </Link>
      </div>
    </DashboardCard>
  );
}
