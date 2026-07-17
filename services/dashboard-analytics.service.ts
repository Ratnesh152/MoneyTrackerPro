import { getAccounts } from './business-central/account.service';
import { transactionService } from './business-central/transaction.service';
import { getBudgets } from './business-central/budget.service';
import { getCreditCards } from './business-central/credit-card.service';
import { getLoans } from './business-central/loan.service';
import { getLoanPayments } from './business-central/loan-payment.service';
import { getCategories } from './business-central/category.service';
import { calculateLoanAnalytics } from './loan-analytics.service';
import { calculateLoanPaymentAnalytics } from './loan-payment-analytics.service';
import { DashboardData, RecentActivityItem } from '@/types/dashboard.types';
import { Transaction } from '@/types/transaction.types';
import { Account } from '@/types/account.types';
import { Budget } from '@/types/budget.types';
import { CreditCard } from '@/types/credit-card.types';
import { Loan } from '@/types/loan.types';
import { LoanPayment } from '@/types/loan-payment.types';
import { Category } from '@/types/category.types';
import { isWithinInterval, startOfMonth, endOfMonth, subMonths, startOfYear, parseISO, isSameMonth } from 'date-fns';
import { getRecurringTransactions } from './business-central/recurring-transaction.service';
import { UpcomingItem } from '@/types/dashboard.types';
import { savingsGoalService } from './business-central/goal.service';
import { SavingsGoal } from '@/types/goal.types';

export type DateRangeFilter = 'current_month' | 'last_3_months' | 'ytd' | 'all_time';

export async function getDashboardAnalytics(
  ownerEntraObjectId: string,
  dateRange: DateRangeFilter = 'current_month'
): Promise<DashboardData> {
  // 1. Fetch all data concurrently using allSettled to prevent one failure from crashing the dashboard
  const results = await Promise.allSettled([
    getAccounts(ownerEntraObjectId, { top: 500 }),
    transactionService.getTransactions(ownerEntraObjectId, { top: 2000, orderBy: 'transactionDate_desc' }),
    getBudgets(ownerEntraObjectId, { top: 100 }),
    getCreditCards(ownerEntraObjectId, { top: 100 }),
    getLoans(ownerEntraObjectId, { top: 100 }),
    getLoanPayments(ownerEntraObjectId, { top: 2000, sort: 'paymentDate_desc' }),
    getCategories(ownerEntraObjectId, { top: 200 }),
    getRecurringTransactions(ownerEntraObjectId, { activeOnly: true }),
    savingsGoalService.getSavingsGoalsByOwner(ownerEntraObjectId)
  ]);

  // Helper to extract value or return empty array if failed
  const extract = (res: PromiseSettledResult<any>) =>
    res.status === 'fulfilled' && res.value && Array.isArray(res.value.value) ? res.value.value : [];

  const accounts: Account[] = extract(results[0]);
  const transactions: Transaction[] = extract(results[1]);
  const budgets: Budget[] = extract(results[2]);
  const creditCards: CreditCard[] = extract(results[3]);
  const loans: Loan[] = extract(results[4]);
  const loanPayments: LoanPayment[] = extract(results[5]);
  const categories: Category[] = extract(results[6]);
  const recurringTransactions: RecurringTransaction[] = extract(results[7]);
  const savingsGoals: SavingsGoal[] = extract(results[8]);

  const categoryMap = new Map<string, Category>(categories.map((c) => [c.systemId, c]));

  // Date Filtering Setup
  const now = new Date();
  let filterStart: Date;
  let filterEnd = now;

  switch (dateRange) {
    case 'current_month':
      filterStart = startOfMonth(now);
      filterEnd = endOfMonth(now);
      break;
    case 'last_3_months':
      filterStart = startOfMonth(subMonths(now, 2));
      break;
    case 'ytd':
      filterStart = startOfYear(now);
      break;
    case 'all_time':
    default:
      filterStart = new Date(2000, 0, 1);
      break;
  }

  const isDateInRange = (dateStr: string) => {
    const d = parseISO(dateStr);
    return d >= filterStart && d <= filterEnd;
  };

  // --- ACCOUNTS (Assets) ---
  let totalCash = 0;
  let bankBalance = 0;
  let walletBalance = 0;
  let totalAssets = 0;

  accounts.forEach((acc) => {
    // Calculate actual balance: opening balance + sum of income - sum of expense
    const accTxs = transactions.filter(t => t.accountId === acc.systemId);
    let currentBalance = acc.openingBalance;
    accTxs.forEach(t => {
      if (t.transactionType === 'Income') currentBalance += t.amount;
      else if (t.transactionType === 'Expense') currentBalance -= t.amount;
    });

    totalAssets += currentBalance;
    if (acc.accountType === 'Cash') totalCash += currentBalance;
    else if (acc.accountType === 'Bank') bankBalance += currentBalance;
    else if (acc.accountType === 'Wallet') walletBalance += currentBalance;
  });

  // --- CREDIT CARDS (Liabilities) ---
  let totalCreditCardBalance = 0;
  let totalCreditLimit = 0;
  let nextCcDueDate: string | null = null;
  const liabilityDistribution: { name: string; amount: number }[] = [];

  creditCards.forEach((cc) => {
    // CC Balance calculated from transactions matching category or some other logic
    // We don't have an explicit link in Transaction schema yet, so just use 0 if undefined
    const currentBalance = 0; // Placeholder until CC payments are fully modeled

    totalCreditCardBalance += currentBalance;
    totalCreditLimit += cc.creditLimit;
    if (currentBalance > 0) {
      liabilityDistribution.push({ name: cc.cardName, amount: currentBalance });
      const due = new Date();
      due.setDate(cc.dueDay);
      if (due < now) due.setMonth(due.getMonth() + 1);
      if (!nextCcDueDate || due < new Date(nextCcDueDate)) {
        nextCcDueDate = due.toISOString();
      }
    }
  });

  const ccUtilization = totalCreditLimit > 0 ? (totalCreditCardBalance / totalCreditLimit) * 100 : 0;

  // --- LOANS (Liabilities) ---
  let totalLoanOutstanding = 0;
  let activeLoansCount = 0;
  let nextEmiAmount: number | null = null;
  let nextEmiDate: string | null = null;
  let criticalLoans = 0;
  let warningLoans = 0;

  loans.forEach((loan) => {
    if (loan.status === 'Closed') return;

    activeLoansCount++;
    const baseAnalytics = calculateLoanAnalytics(loan);
    const paymentsForLoan = loanPayments.filter((p) => p.loanSystemId === loan.systemId);
    const analytics = calculateLoanPaymentAnalytics(baseAnalytics, paymentsForLoan);

    totalLoanOutstanding += analytics.outstandingPrincipal;
    if (analytics.outstandingPrincipal > 0) {
      liabilityDistribution.push({ name: loan.lenderName, amount: analytics.outstandingPrincipal });
    }

    if (analytics.loanHealth === 'Critical') criticalLoans++;
    if (analytics.loanHealth === 'Warning') warningLoans++;

    const nextEmiRow = baseAnalytics.schedule.find((s) => s.month === analytics.currentEMI);
    if (nextEmiRow) {
      if (!nextEmiDate || new Date(nextEmiRow.date) < new Date(nextEmiDate)) {
        nextEmiDate = nextEmiRow.date;
        nextEmiAmount = nextEmiRow.emi;
      }
    }
  });

  let overallLoanHealth: 'Excellent' | 'Good' | 'Needs Attention' | 'Critical' | 'No Data' = 'No Data';
  if (activeLoansCount > 0) {
    if (criticalLoans > 0) overallLoanHealth = 'Critical';
    else if (warningLoans > 0) overallLoanHealth = 'Needs Attention';
    else overallLoanHealth = 'Excellent';
  }

  // --- NET WORTH ---
  const totalLiabilities = totalCreditCardBalance + totalLoanOutstanding;
  const netWorth = totalAssets - totalLiabilities;

  // --- CASH FLOW (Filtered by Date Range) ---
  let income = 0;
  let expense = 0;
  const expenseCategoriesMap = new Map<string, number>();

  transactions.forEach((t) => {
    if (!isDateInRange(t.transactionDate)) return;

    if (t.transactionType === 'Income') {
      income += t.amount;
    } else if (t.transactionType === 'Expense') {
      expense += t.amount;

      const cat = t.categoryId ? categoryMap.get(t.categoryId) : undefined;
      const catName = cat?.name || 'Uncategorized';
      expenseCategoriesMap.set(catName, (expenseCategoriesMap.get(catName) || 0) + t.amount);
    }
  });

  // Also include Loan Payments as Expenses in cash flow
  loanPayments.forEach(p => {
    if (p.status === 'Cancelled' || !p.paymentDate || !isDateInRange(p.paymentDate)) return;
    expense += p.amountPaid;
    expenseCategoriesMap.set('Loan EMIs', (expenseCategoriesMap.get('Loan EMIs') || 0) + p.amountPaid);
  });

  const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;

  const expenseCategories = Array.from(expenseCategoriesMap.entries())
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 6); // Top 6

  // --- BUDGET HEALTH ---
  let totalBudget = 0;
  let totalUsed = 0;
  let overspentCategoriesCount = 0;
  const budgetUtilization: { name: string; used: number; remaining: number; limit: number }[] = [];

  budgets.forEach((b) => {
    totalBudget += b.budgetAmount;

    // Calculate used amount for this budget in the CURRENT month (budgets are inherently monthly)
    const catTxs = transactions.filter((t) =>
      t.categoryId === b.categoryId &&
      t.transactionType === 'Expense' &&
      isSameMonth(parseISO(t.transactionDate), now)
    );
    const used = catTxs.reduce((sum, t) => sum + t.amount, 0);
    totalUsed += used;

    if (used > b.budgetAmount) {
      overspentCategoriesCount++;
    }

    const cat = categoryMap.get(b.categoryId);
    budgetUtilization.push({
      name: cat?.name || 'Unknown',
      used,
      remaining: Math.max(0, b.budgetAmount - used),
      limit: b.budgetAmount
    });
  });

  const totalRemaining = Math.max(0, totalBudget - totalUsed);

  // --- RECENT ACTIVITY ---
  const recentActivity: RecentActivityItem[] = [];

  transactions.slice(0, 20).forEach(t => {
    recentActivity.push({
      id: t.systemId,
      type: 'Transaction',
      title: t.description || 'Transaction',
      amount: t.amount,
      date: t.transactionDate,
      status: t.transactionType
    });
  });

  loanPayments.slice(0, 20).forEach(p => {
    if (p.status === 'Cancelled') return;
    const loan = loans.find(l => l.systemId === p.loanSystemId);
    recentActivity.push({
      id: p.systemId,
      type: 'LoanPayment',
      title: `EMI Payment: ${loan?.lenderName || 'Loan'}`,
      amount: p.amountPaid,
      date: p.paymentDate || p.systemCreatedAt,
      status: p.status
    });
  });

  // Sort and take top 10
  recentActivity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const latestActivity = recentActivity.slice(0, 10);

  // --- UPCOMING ITEMS ---
  const upcomingItems: UpcomingItem[] = [];
  
  recurringTransactions.forEach(rt => {
    if (rt.active && rt.nextRunDate) {
      upcomingItems.push({
        id: rt.systemId,
        type: 'Recurring',
        title: rt.name,
        amount: rt.amount,
        date: rt.nextRunDate
      });
    }
  });

  loans.forEach((loan) => {
    if (loan.status === 'Closed') return;
    const baseAnalytics = calculateLoanAnalytics(loan);
    const paymentsForLoan = loanPayments.filter((p) => p.loanSystemId === loan.systemId);
    const analytics = calculateLoanPaymentAnalytics(baseAnalytics, paymentsForLoan);
    const nextEmiRow = baseAnalytics.schedule.find((s) => s.month === analytics.currentEMI);
    
    if (nextEmiRow) {
      // Check if it's already paid this month
      const alreadyPaid = paymentsForLoan.some(p => p.status !== 'Cancelled' && p.paymentDate?.startsWith(nextEmiRow.date.substring(0, 7)));
      if (!alreadyPaid) {
        upcomingItems.push({
          id: `emi-${loan.systemId}`,
          type: 'EMI',
          title: `EMI: ${loan.lenderName}`,
          amount: nextEmiRow.emi,
          date: nextEmiRow.date
        });
      }
    }
  });

  // Sort upcoming items by date (earliest first)
  upcomingItems.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  // Filter out past items that are more than 7 days old to avoid cluttering upcoming with missed things
  const upcomingFiltered = upcomingItems.filter(item => {
    const itemDate = new Date(item.date);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return itemDate >= sevenDaysAgo;
  });
  const upcomingTop5 = upcomingFiltered.slice(0, 5);

  // --- FINANCIAL HEALTH SCORE ---
  // Score 0-100
  let score = 100;

  // Savings Rate (ideal > 20%)
  if (savingsRate < 0) score -= 20;
  else if (savingsRate < 10) score -= 10;
  else if (savingsRate > 20) score += 5; // Bonus

  // Budget
  if (totalBudget > 0) {
    const budgetUsage = (totalUsed / totalBudget) * 100;
    if (budgetUsage > 100) score -= 15;
    else if (budgetUsage > 90) score -= 5;
  }
  score -= (overspentCategoriesCount * 5); // -5 for each overspent

  // Loans
  if (criticalLoans > 0) score -= 20;
  if (warningLoans > 0) score -= 10;

  // Credit Card Utilization (ideal < 30%)
  if (ccUtilization > 80) score -= 20;
  else if (ccUtilization > 50) score -= 10;
  else if (ccUtilization > 30) score -= 5;

  score = Math.max(0, Math.min(100, score));

  let healthStatus: 'Excellent' | 'Good' | 'Needs Attention' | 'Critical' = 'Good';
  if (score >= 80) healthStatus = 'Excellent';
  else if (score >= 60) healthStatus = 'Good';
  else if (score >= 40) healthStatus = 'Needs Attention';
  else healthStatus = 'Critical';

  // --- ASSET DISTRIBUTION ---
  const assetDistribution = [
    { name: 'Cash', amount: totalCash },
    { name: 'Bank', amount: bankBalance },
    { name: 'Wallet', amount: walletBalance }
  ].filter(a => a.amount > 0);

  // --- CHARTS (DUMMY TREND DATA FOR NOW) ---
  // Net Worth Trend (generating last 6 months for visualization)
  const netWorthTrend = [];
  for (let i = 5; i >= 0; i--) {
    const m = subMonths(now, i);
    netWorthTrend.push({
      date: m.toLocaleString('default', { month: 'short' }),
      assets: totalAssets * (1 - (i * 0.02)), // Fake historical trend
      liabilities: totalLiabilities * (1 + (i * 0.01)),
      netWorth: (totalAssets * (1 - (i * 0.02))) - (totalLiabilities * (1 + (i * 0.01)))
    });
  }

  // Monthly Cash Flow
  const monthlyCashFlow = [];
  for (let i = 5; i >= 0; i--) {
    const m = subMonths(now, i);
    const mStr = m.toISOString().substring(0, 7);

    // Calculate historical for this exact month
    const mIncome = transactions.filter(t => t.transactionType === 'Income' && t.transactionDate.startsWith(mStr)).reduce((s, t) => s + t.amount, 0);
    const mExpenseTxs = transactions.filter(t => t.transactionType === 'Expense' && t.transactionDate.startsWith(mStr)).reduce((s, t) => s + t.amount, 0);
    const mLoan = loanPayments.filter(p => p.paymentDate?.startsWith(mStr) && p.status !== 'Cancelled').reduce((s, p) => s + p.amountPaid, 0);

    monthlyCashFlow.push({
      month: m.toLocaleString('default', { month: 'short' }),
      income: mIncome,
      expense: mExpenseTxs + mLoan
    });
  }

  const isEmpty = accounts.length === 0 && transactions.length === 0;

  return {
    netWorth: {
      assets: totalAssets,
      liabilities: totalLiabilities,
      total: netWorth
    },
    cashFlow: {
      income,
      expense,
      savingsRate
    },
    budgetHealth: {
      totalBudget,
      totalUsed,
      totalRemaining,
      overspentCategoriesCount
    },
    loanSummary: {
      outstandingPrincipal: totalLoanOutstanding,
      activeLoansCount,
      nextEmiAmount,
      nextEmiDate,
      loanHealth: overallLoanHealth
    },
    creditCardSummary: {
      outstandingBalance: totalCreditCardBalance,
      availableCredit: Math.max(0, totalCreditLimit - totalCreditCardBalance),
      utilizationPercentage: ccUtilization,
      nextDueDate: nextCcDueDate
    },
    accountSummary: {
      totalCash,
      bankBalance,
      walletBalance
    },
    financialHealth: {
      score: Math.round(score),
      status: healthStatus
    },
    recentActivity: latestActivity,
    upcomingItems: upcomingTop5,
    savingsGoals,
    charts: {
      netWorthTrend,
      monthlyCashFlow,
      expenseCategories,
      budgetUtilization,
      liabilityDistribution,
      assetDistribution
    },
    isEmpty
  };
}
