import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { investmentService } from '@/services/business-central/investment.service';
import { InvestmentTable } from '@/components/features/investments/InvestmentTable';
import { InvestmentDialog } from '@/components/features/investments/InvestmentDialog';
import { InvestmentProgressCard } from '@/components/features/investments/InvestmentProgressCard';

export default async function InvestmentsPage() {
  const session = await auth();
  const ownerOid = session?.user?.id;

  if (!ownerOid) {
    redirect('/login');
  }

  const investments = await investmentService.getInvestmentsByOwner(ownerOid);

  return (
    <div className="flex flex-col space-y-6 max-w-[1600px] mx-auto w-full pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Investments</h2>
          <p className="text-muted-foreground mt-1">Track and manage your investment portfolio.</p>
        </div>
        <InvestmentDialog />
      </div>

      <InvestmentProgressCard investments={investments} />

      <div className="mt-8">
        <InvestmentTable investments={investments} />
      </div>
    </div>
  );
}
