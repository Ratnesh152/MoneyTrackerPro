import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getRecurringTransactions } from '@/services/business-central/recurring-transaction.service';
import { getAccounts } from '@/services/business-central/account.service';
import { getCategories } from '@/services/business-central/category.service';
import { RecurringTransactionTable } from '@/components/recurring-transactions/RecurringTransactionTable';
import { createRecurringAction, updateRecurringAction, deleteRecurringAction, runEngineAction } from './actions';

export default async function RecurringTransactionsPage() {
  const session = await auth();
  const ownerOid = session?.user?.id;
  
  if (!ownerOid) {
    redirect('/login');
  }

  // Fetch all necessary data concurrently
  const [transactionsRes, accountsRes, categoriesRes] = await Promise.all([
    getRecurringTransactions(ownerOid),
    getAccounts(ownerOid, { top: 500 }),
    getCategories(ownerOid, { top: 200 })
  ]);

  return (
    <div className="flex flex-col space-y-6 max-w-[1600px] mx-auto w-full pb-10">
      <RecurringTransactionTable
        transactions={transactionsRes.value}
        accounts={accountsRes.value}
        categories={categoriesRes.value}
        ownerEntraObjectId={ownerOid}
        createAction={createRecurringAction}
        updateAction={updateRecurringAction}
        deleteAction={deleteRecurringAction}
        runEngineAction={runEngineAction}
      />
    </div>
  );
}
