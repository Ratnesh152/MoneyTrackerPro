import { SavingsGoal } from './goal.types';

export interface NetWorthSummary {
  assets: number;
  liabilities: number;
  total: number;
}

export interface CashFlowSummary {
  income: number;
  expense: number;
  savingsRate: number;
}

export interface BudgetHealthSummary {
  totalBudget: number;
  totalUsed: number;
  totalRemaining: number;
  overspentCategoriesCount: number;
}

export interface LoanDashboardSummary {
  outstandingPrincipal: number;
  activeLoansCount: number;
  nextEmiAmount: number | null;
  nextEmiDate: string | null;
  loanHealth: 'Excellent' | 'Good' | 'Needs Attention' | 'Critical' | 'No Data';
}

export interface CreditCardDashboardSummary {
  outstandingBalance: number;
  availableCredit: number;
  utilizationPercentage: number;
  nextDueDate: string | null;
}

export interface AccountDashboardSummary {
  totalCash: number;
  bankBalance: number;
  walletBalance: number;
}

export type FinancialHealthStatus = 'Excellent' | 'Good' | 'Needs Attention' | 'Critical';

export interface FinancialHealth {
  score: number; // 0-100
  status: FinancialHealthStatus;
}

export interface RecentActivityItem {
  id: string;
  type: 'Transaction' | 'LoanPayment';
  title: string;
  amount: number;
  date: string;
  status?: string;
}

export interface DashboardChartsData {
  netWorthTrend: { date: string; assets: number; liabilities: number; netWorth: number }[];
  monthlyCashFlow: { month: string; income: number; expense: number }[];
  expenseCategories: { name: string; amount: number; color?: string }[];
  budgetUtilization: { name: string; used: number; remaining: number; limit: number }[];
  liabilityDistribution: { name: string; amount: number }[];
  assetDistribution: { name: string; amount: number }[];
}

export interface UpcomingItem {
  id: string;
  title: string;
  amount: number;
  date: string;
  type: 'Recurring' | 'EMI';
}

export interface DashboardData {
  netWorth: NetWorthSummary;
  cashFlow: CashFlowSummary;
  budgetHealth: BudgetHealthSummary;
  loanSummary: LoanDashboardSummary;
  creditCardSummary: CreditCardDashboardSummary;
  accountSummary: AccountDashboardSummary;
  financialHealth: FinancialHealth;
  recentActivity: RecentActivityItem[];
  upcomingItems: UpcomingItem[];
  savingsGoals: SavingsGoal[];
  charts: DashboardChartsData;
  isEmpty: boolean;
}
