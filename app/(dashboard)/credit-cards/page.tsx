import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getCreditCards } from '@/services/business-central/credit-card.service';
import { CreditCardFilters } from '@/components/features/credit-cards/CreditCardFilters';
import { CreditCardTable } from '@/components/features/credit-cards/CreditCardTable';
import { CreditCardEmptyState } from '@/components/features/credit-cards/CreditCardEmptyState';
import { CreditCardPagination } from '@/components/features/credit-cards/CreditCardPagination';
import { AddCreditCardButton } from '@/components/features/credit-cards/AddCreditCardButton';
import { AlertCircle } from 'lucide-react';

export const metadata = {
  title: 'Credit Cards - MoneyTracker Pro',
};

export default async function CreditCardsPage({
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
  const network = typeof resolvedParams.network === 'string' ? resolvedParams.network : undefined;
  
  let isActive: boolean | undefined = undefined;
  if (typeof resolvedParams.isActive === 'string') {
    isActive = resolvedParams.isActive === 'true';
  }

  const skip = typeof resolvedParams.skip === 'string' ? parseInt(resolvedParams.skip, 10) : 0;
  const top = typeof resolvedParams.top === 'string' ? parseInt(resolvedParams.top, 10) : 50;
  const sort = typeof resolvedParams.sort === 'string' ? resolvedParams.sort : undefined;

  let creditCardsResponse;
  let apiError = null;

  try {
    creditCardsResponse = await getCreditCards(session.user.id, {
      search,
      network,
      isActive,
      skip,
      top,
      sort,
    });
  } catch (error: any) {
    console.error('[CreditCardsPage] API Error:', error);
    apiError = error.message || 'Failed to connect to Business Central.';
  }

  const creditCards = creditCardsResponse?.value || [];
  const hasCards = creditCards.length > 0;
  const isFiltering = !!search || !!network || isActive !== undefined;
  const hasNextPage = !!creditCardsResponse?.['@odata.nextLink'];
  const totalCount = creditCardsResponse?.['@odata.count'];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Credit Cards</h2>
        <div className="flex items-center space-x-2">
          <AddCreditCardButton />
        </div>
      </div>

      <div className="mb-4">
        <p className="text-muted-foreground text-sm">
          Manage your credit card liabilities, statement cycles, and spending limits.
        </p>
      </div>

      {apiError ? (
        <div className="p-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 mt-0.5" />
          <div>
            <div className="font-semibold mb-1">Connection Error</div>
            <div>
              {apiError}
              <br />
              Please check your Business Central Sandbox connection or API configuration.
            </div>
          </div>
        </div>
      ) : (
        <>
          <CreditCardFilters />

          {hasCards ? (
            <>
              <CreditCardTable creditCards={creditCards} />
              <CreditCardPagination totalCount={totalCount} hasNextPage={hasNextPage} />
            </>
          ) : isFiltering ? (
            <div className="text-center p-8 border rounded-md bg-muted/10">
              <p className="text-muted-foreground">No credit cards found matching your filters.</p>
            </div>
          ) : (
            <CreditCardEmptyState />
          )}
        </>
      )}
    </div>
  );
}
