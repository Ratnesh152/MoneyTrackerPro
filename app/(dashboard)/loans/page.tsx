import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getLoans } from '@/services/business-central/loan.service';
import { LoanTable } from '@/components/features/loans/LoanTable';
import { LoanEmptyState } from '@/components/features/loans/LoanEmptyState';
import { LoanPagination } from '@/components/features/loans/LoanPagination';
import { AddLoanButton } from '@/components/features/loans/AddLoanButton';
import { LoanFilters } from '@/components/features/loans/LoanFilters';
import { AlertCircle } from 'lucide-react';

export const metadata = {
  title: 'Loans - MoneyTracker Pro',
};

export default async function LoansPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  let loansResponse = { value: [], '@odata.count': 0 };
  let apiError = null;

  try {
    loansResponse = await getLoans(session.user.id, {
      search: searchParams.search,
      status: searchParams.status,
      loanType: searchParams.loanType,
      skip: searchParams.skip ? parseInt(searchParams.skip) : undefined,
      sort: searchParams.sort,
      top: 50,
    }) as any;
  } catch (error: any) {
    apiError = error.message || 'Failed to fetch loans from Business Central.';
  }

  const hasNoLoansAtAll = !searchParams.search && !searchParams.status && !searchParams.loanType && loansResponse.value.length === 0 && !apiError;

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Loans</h2>
        <div className="flex items-center space-x-2">
          {!hasNoLoansAtAll && <AddLoanButton />}
        </div>
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
          {!hasNoLoansAtAll && <LoanFilters />}
          
          {hasNoLoansAtAll ? (
            <LoanEmptyState />
          ) : loansResponse.value.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground border rounded-lg bg-card/50">
              No loans match your current filters.
            </div>
          ) : (
            <div className="space-y-4">
              <LoanTable loans={loansResponse.value} />
              <LoanPagination totalCount={loansResponse['@odata.count'] || 0} pageSize={50} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
