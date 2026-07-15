import { TransactionTable } from '@/components/features/transactions/TransactionTable';
import { TransactionFilters } from '@/components/features/transactions/TransactionFilters';
import { TransactionPagination } from '@/components/features/transactions/TransactionPagination';
import { TransactionEmptyState } from '@/components/features/transactions/TransactionEmptyState';
import { AddTransactionButton } from '@/components/features/transactions/AddTransactionButton';
import { transactionService } from '@/services/business-central/transaction.service';
import { getAccounts } from '@/services/business-central/account.service';
import { getCategories } from '@/services/business-central/category.service';
import { auth } from '@/auth';

export const metadata = {
  title: 'Transactions | MoneyTracker Pro',
};

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return <div>Unauthorized</div>;
  }

  const resolvedParams = await searchParams;
  const top = Number(resolvedParams.top) || 20;
  const skip = Number(resolvedParams.skip) || 0;
  
  const typeParam = resolvedParams.type as string | undefined;
  const categoryParam = resolvedParams.category as string | undefined;
  const searchParam = resolvedParams.search as string | undefined;
  const sortParam = resolvedParams.sort as string | undefined;

  // Build OData filter
  const filterParts = [];
  if (typeParam) filterParts.push(`transactionType eq '${typeParam}'`);
  if (categoryParam) filterParts.push(`categoryCode eq '${categoryParam}'`);
  if (searchParam) {
    filterParts.push(`(contains(description,'${searchParam}') or contains(reference,'${searchParam}') or contains(accountCode,'${searchParam}') or contains(categoryCode,'${searchParam}'))`);
  }
  const filter = filterParts.length > 0 ? filterParts.join(' and ') : undefined;
  
  // Build OData orderBy
  let orderBy = undefined;
  if (sortParam) {
    const [field, direction] = sortParam.split('_');
    if (field && direction) {
      orderBy = `${field} ${direction}`;
    }
  } else {
    orderBy = 'transactionDate desc';
  }

  // Concurrently load all data required for the UI
  const [data, accountsRes, categoriesRes] = await Promise.all([
    transactionService.getTransactions(session.user.id, {
      top,
      skip,
      filter,
      orderBy,
    }),
    getAccounts(session.user.id, { top: 1000 }),
    getCategories(session.user.id, { top: 1000 })
  ]);

  // Provide only active categories for forms
  const activeCategories = categoriesRes.value.filter((c: { isActive: boolean }) => c.isActive);

  const hasActiveFilters = !!(typeParam || categoryParam || searchParam);

  const noAccountsOrCategories = accountsRes.value.length === 0 || activeCategories.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">Manage your income and expenses.</p>
        </div>
        <AddTransactionButton
          accounts={accountsRes.value}
          categories={activeCategories}
          disabled={noAccountsOrCategories}
        />
      </div>

      <TransactionFilters />

      {data.value.length === 0 && !hasActiveFilters ? (
        <TransactionEmptyState accounts={accountsRes.value} categories={activeCategories} />
      ) : (
        <>
          <div className="rounded-md border bg-card text-card-foreground shadow-sm">
            <TransactionTable 
              initialData={data} 
              accounts={accountsRes.value}
              categories={activeCategories}
            />
          </div>
          <TransactionPagination 
            nextLink={data.nextLink} 
            skip={skip} 
            top={top} 
            hasMore={data.value.length === top} 
          />
        </>
      )}
    </div>
  );
}
