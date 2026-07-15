import { Budget, BudgetWithUtilization } from '@/types/budget.types';
import { getBudgets } from './business-central/budget.service';
import { transactionService } from './business-central/transaction.service';
import { getCategories } from './business-central/category.service';

export interface BudgetAnalyticsSummary {
  monthlyBudget: number;
  spent: number;
  remaining: number;
  utilizationPercentage: number;
}

export interface BudgetDashboardData {
  budgets: BudgetWithUtilization[];
  summary: BudgetAnalyticsSummary;
  topOverspent: BudgetWithUtilization[];
}

export class BudgetAnalyticsService {
  /**
   * Fetches budgets for a specific month and year, calculates utilization, and aggregates summary.
   */
  async getBudgetDashboardData(
    ownerOid: string,
    month: number,
    year: number
  ): Promise<BudgetDashboardData> {
    // 1. Fetch budgets for the period
    const budgetsResponse = await getBudgets(ownerOid, {
      budgetMonth: month,
      budgetYear: year,
      top: 100 // assuming max 100 budgets per month
    });
    const budgets = budgetsResponse.value;

    // 2. Fetch categories to map names
    const categoriesResponse = await getCategories(ownerOid, { top: 1000 });
    const categoryMap = new Map(categoriesResponse.value.map(c => [c.systemId, c.name]));

    // 3. Fetch all expense transactions for the period
    // Date filtering: Since we load all and filter client side (or standard OData if supported)
    // We'll fetch all expenses for the given year/month.
    // Given the small scale, we can fetch top 1000 transactions and filter by date.
    const txResponse = await transactionService.getTransactions(ownerOid, {
      top: 1000,
    });
    
    // Filter transactions: must be Expense and match month/year
    const expenses = txResponse.value.filter(tx => {
      if (tx.transactionType !== 'Expense') return false;
      const txDate = new Date(tx.transactionDate);
      return txDate.getMonth() + 1 === month && txDate.getFullYear() === year;
    });

    // Aggregate spent per category
    const spentByCategory = new Map<string, number>();
    for (const expense of expenses) {
      const current = spentByCategory.get(expense.categoryId) || 0;
      spentByCategory.set(expense.categoryId, current + expense.amount);
    }

    // 4. Calculate BudgetWithUtilization
    let totalBudget = 0;
    let totalSpent = 0;

    const budgetsWithUtilization: BudgetWithUtilization[] = budgets.map(b => {
      const spentAmount = spentByCategory.get(b.categoryId) || 0;
      const remainingAmount = b.budgetAmount - spentAmount;
      const utilizationPercentage = b.budgetAmount > 0 
        ? Math.round((spentAmount / b.budgetAmount) * 100) 
        : (spentAmount > 0 ? 100 : 0);
      
      totalBudget += b.budgetAmount;
      totalSpent += spentAmount;

      return {
        ...b,
        categoryName: categoryMap.get(b.categoryId) || 'Unknown Category',
        spentAmount,
        remainingAmount,
        utilizationPercentage
      };
    });

    const summary: BudgetAnalyticsSummary = {
      monthlyBudget: totalBudget,
      spent: totalSpent,
      remaining: totalBudget - totalSpent,
      utilizationPercentage: totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0
    };

    // Sort to find top overspent
    const topOverspent = [...budgetsWithUtilization]
      .filter(b => b.utilizationPercentage >= 100)
      .sort((a, b) => b.utilizationPercentage - a.utilizationPercentage)
      .slice(0, 5);

    // Also sort the main list by utilization descending
    budgetsWithUtilization.sort((a, b) => b.utilizationPercentage - a.utilizationPercentage);

    return {
      budgets: budgetsWithUtilization,
      summary,
      topOverspent
    };
  }
}

export const budgetAnalyticsService = new BudgetAnalyticsService();
