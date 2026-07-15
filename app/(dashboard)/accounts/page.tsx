import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getAccounts } from '@/services/business-central/account.service';
import { AccountFilters } from '@/components/features/accounts/AccountFilters';
import { AccountTable } from '@/components/features/accounts/AccountTable';
import { AccountEmptyState } from '@/components/features/accounts/AccountEmptyState';
import { AccountPagination } from '@/components/features/accounts/AccountPagination';
import { AddAccountButton } from '@/components/features/accounts/AddAccountButton';

export const metadata = {
  title: 'Accounts - MoneyTracker Pro',
};

export default async function AccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const resolvedParams = await searchParams;
  const search = typeof resolvedParams.search === 'string' ? resolvedParams.search : undefined;
  const type = typeof resolvedParams.type === 'string' ? resolvedParams.type : undefined;
  const skip = typeof resolvedParams.skip === 'string' ? parseInt(resolvedParams.skip, 10) : 0;
  const top = typeof resolvedParams.top === 'string' ? parseInt(resolvedParams.top, 10) : 50;
  const sort = typeof resolvedParams.sort === 'string' ? resolvedParams.sort : undefined;

  const accountsResponse = await getAccounts(session.user.id, {
    search,
    type,
    skip,
    top,
    sort,
  });

  const accounts = accountsResponse.value;
  const hasAccounts = accounts.length > 0;
  const isSearch = !!search || !!type;
  const hasNextPage = !!accountsResponse['@odata.nextLink'];
  const totalCount = accountsResponse['@odata.count'];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Accounts</h2>
        <div className="flex items-center space-x-2">
          <AddAccountButton />
        </div>
      </div>

      <div className="space-y-4">
        <AccountFilters />
        
        {!hasAccounts ? (
          <AccountEmptyState isSearch={isSearch} />
        ) : (
          <>
            <AccountTable accounts={accounts} />
            <AccountPagination totalCount={totalCount} hasNextPage={hasNextPage} />
          </>
        )}
      </div>
    </div>
  );
}
