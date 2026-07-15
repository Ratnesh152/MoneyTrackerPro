import { transactionService } from './business-central/transaction.service';
import { getAccounts } from './business-central/account.service';
import { getCategories } from './business-central/category.service';
import { Transaction } from '@/types/transaction.types';
import { Account } from '@/types/account.types';
import { Category } from '@/types/category.types';
import { 
  DashboardResponse, DashboardSummary, 
  DashboardAccountSummary, DashboardCategorySummary, IncomeExpenseData, CashFlowData 
} from '@/types/dashboard.types';

async function fetchAllTransactions(ownerOid: string): Promise<Transaction[]> {
  let allTransactions: Transaction[] = [];
  let nextLink: string | undefined = undefined;
  
  try {
    do {
      const response = await transactionService.getTransactions(ownerOid, nextLink ? { nextLink } : { top: 500 });
      allTransactions = allTransactions.concat(response.value);
      nextLink = response.nextLink;
    } while (nextLink);
  } catch (error) {
    console.error('[Dashboard] Failed to fetch transactions:', error);
    // Return empty array — dashboard still renders with zero transactions
    return [];
  }

  return allTransactions;
}

function getDashboardSummary(accounts: Account[], categories: Category[], transactions: Transaction[]): DashboardSummary {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  let netWorth = 0;
  let monthlyIncome = 0;
  let monthlyExpense = 0;

  // Add opening balances to net worth
  for (const account of accounts) {
    netWorth += account.openingBalance || 0;
  }

  for (const t of transactions) {
    const tDate = new Date(t.transactionDate);
    const isCurrentMonth = tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;

    if (t.transactionType === 'Income') {
      netWorth += t.amount;
      if (isCurrentMonth) monthlyIncome += t.amount;
    } else if (t.transactionType === 'Expense') {
      netWorth -= t.amount;
      if (isCurrentMonth) monthlyExpense += t.amount;
    }
  }

  return {
    netWorth,
    monthlyIncome,
    monthlyExpense,
    totalAccounts: accounts.length,
    totalTransactions: transactions.length,
    totalCategories: categories.length,
  };
}

function getIncomeExpenseSummary(transactions: Transaction[]): IncomeExpenseData[] {
  const currentYear = new Date().getFullYear();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyData: Record<string, { income: number; expense: number }> = {};

  months.forEach(m => monthlyData[m] = { income: 0, expense: 0 });

  transactions.forEach(t => {
    const tDate = new Date(t.transactionDate);
    if (tDate.getFullYear() === currentYear) {
      const monthName = months[tDate.getMonth()];
      if (t.transactionType === 'Income') {
        monthlyData[monthName].income += t.amount;
      } else if (t.transactionType === 'Expense') {
        monthlyData[monthName].expense += t.amount;
      }
    }
  });

  return months.map(m => ({
    name: m,
    income: monthlyData[m].income,
    expense: monthlyData[m].expense,
  }));
}

function getAccountSummary(accounts: Account[], transactions: Transaction[]): DashboardAccountSummary[] {
  return accounts.map(acc => {
    let currentBalance = acc.openingBalance || 0;
    
    transactions.forEach(t => {
      if (t.accountId === acc.systemId) {
        if (t.transactionType === 'Income') {
          currentBalance += t.amount;
        } else if (t.transactionType === 'Expense') {
          currentBalance -= t.amount;
        }
      }
    });

    return {
      name: acc.name,
      balance: currentBalance,
      type: acc.accountType
    };
  });
}

function getCategorySummary(categories: Category[], transactions: Transaction[]): DashboardCategorySummary[] {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const categoryMap: Record<string, DashboardCategorySummary> = {};

  categories.forEach(c => {
    categoryMap[c.systemId] = {
      name: c.name,
      amount: 0,
      iconName: c.iconName,
      colorCode: c.colorCode
    };
  });

  transactions.forEach(t => {
    const tDate = new Date(t.transactionDate);
    if (tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear && t.transactionType === 'Expense') {
      if (categoryMap[t.categoryId]) {
        categoryMap[t.categoryId].amount += t.amount;
      }
    }
  });

  return Object.values(categoryMap)
    .filter(c => c.amount > 0)
    .sort((a, b) => b.amount - a.amount);
}

function getCashFlow(accounts: Account[], transactions: Transaction[]): CashFlowData[] {
  // Sort transactions chronologically
  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime()
  );

  let runningBalance = accounts.reduce((sum, acc) => sum + (acc.openingBalance || 0), 0);
  const flowMap: Record<string, number> = {};

  sortedTransactions.forEach(t => {
    if (t.transactionType === 'Income') {
      runningBalance += t.amount;
    } else if (t.transactionType === 'Expense') {
      runningBalance -= t.amount;
    }
    // Record end of day balance
    flowMap[t.transactionDate] = runningBalance;
  });

  // Convert to array and take last 30 days of activity
  const dates = Object.keys(flowMap).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  
  return dates.slice(-30).map(d => ({
    date: new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    balance: flowMap[d]
  }));
}

function getRecentTransactions(transactions: Transaction[]): Transaction[] {
  return [...transactions]
    .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime() || new Date(b.systemCreatedAt).getTime() - new Date(a.systemCreatedAt).getTime())
    .slice(0, 5);
}

export async function getDashboardData(ownerOid: string): Promise<DashboardResponse> {
  // Wrap in try-catch to prevent dashboard crash if BC API fails
  const transactionsPromise = fetchAllTransactions(ownerOid).catch(err => {
    console.error('[Dashboard] Transactions failed:', err);
    return [];
  });
  
  const accountsPromise = getAccounts(ownerOid, { top: 100 }).catch(err => {
    console.error('[Dashboard] Accounts failed:', err);
    return { value: [] };
  });

  const categoriesPromise = getCategories(ownerOid, { top: 500 }).catch(err => {
    console.error('[Dashboard] Categories failed:', err);
    return { value: [] };
  });

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const budgetsPromise = import('./budget-analytics.service')
    .then(mod => mod.budgetAnalyticsService.getBudgetDashboardData(ownerOid, currentMonth, currentYear))
    .catch(err => {
      console.error('[Dashboard] Budgets failed:', err);
      return undefined;
    });

  const [transactions, accountsResponse, categoriesResponse, budgetAnalytics] = await Promise.all([
    transactionsPromise,
    accountsPromise,
    categoriesPromise,
    budgetsPromise
  ]);

  const accounts = accountsResponse.value;
  const categories = categoriesResponse.value;

  const summary = getDashboardSummary(accounts, categories, transactions);
  const incomeVsExpense = getIncomeExpenseSummary(transactions);
  const expenseCategories = getCategorySummary(categories, transactions);
  const cashFlow = getCashFlow(accounts, transactions);
  const recentTransactions = getRecentTransactions(transactions);
  const accountsOverview = getAccountSummary(accounts, transactions);

  return {
    summary,
    charts: {
      incomeVsExpense,
      expenseCategories,
      cashFlow
    },
    recentTransactions,
    accountsOverview,
    categorySummary: expenseCategories,
    budgetAnalytics
  };
}
