import { Transaction } from './transaction.types';
import { BudgetDashboardData } from '@/services/budget-analytics.service';

export interface DashboardAccountSummary {
  name: string;
  balance: number;
  type: string;
}

export interface DashboardCategorySummary {
  name: string;
  amount: number;
  colorCode?: string;
  iconName?: string;
}

export interface IncomeExpenseData {
  name: string;
  income: number;
  expense: number;
}

export interface CashFlowData {
  date: string;
  balance: number;
}

export interface DashboardCharts {
  incomeVsExpense: IncomeExpenseData[];
  expenseCategories: DashboardCategorySummary[];
  cashFlow: CashFlowData[];
}

export interface DashboardSummary {
  netWorth: number;
  monthlyIncome: number;
  monthlyExpense: number;
  totalAccounts: number;
  totalTransactions: number;
  totalCategories: number;
}

export interface DashboardResponse {
  summary: DashboardSummary;
  charts: DashboardCharts;
  recentTransactions: Transaction[];
  accountsOverview: DashboardAccountSummary[];
  categorySummary: DashboardCategorySummary[];
  budgetAnalytics?: BudgetDashboardData;
}
