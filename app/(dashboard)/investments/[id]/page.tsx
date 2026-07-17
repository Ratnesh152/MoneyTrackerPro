import React from 'react';
import { auth } from '@/auth';
import { notFound, redirect } from 'next/navigation';
import { investmentService } from '@/services/business-central/investment.service';
import { InvestmentDialog } from '@/components/features/investments/InvestmentDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { investmentAnalyticsService } from '@/services/investment-analytics.service';
import { TrendingDown, TrendingUp, Wallet, Banknote, Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function InvestmentDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const ownerOid = session?.user?.id;

  if (!ownerOid) {
    redirect('/login');
  }

  const investment = await investmentService.getInvestmentById(params.id, ownerOid);

  if (!investment) {
    notFound();
  }

  const { profitOrLoss, returnPercentage, isProfitable } = investmentAnalyticsService.calculateAnalytics(investment);

  return (
    <div className="flex flex-col space-y-6 max-w-[1200px] mx-auto w-full pb-10">
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <Link href="/investments" className="hover:text-primary transition-colors">
          Investments
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">{investment.name}</span>
      </div>

      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{investment.name}</h2>
          <p className="text-muted-foreground mt-1">{investment.type.replace(/([A-Z])/g, ' $1').trim()} • {investment.status}</p>
        </div>
        <InvestmentDialog investment={investment} trigger={<Button>Edit Investment</Button>} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invested Amount</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{investment.investedAmount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total principal value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Value</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{investment.currentValue.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Latest recorded value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Return on Investment</CardTitle>
            {isProfitable ? (
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-rose-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold flex items-end gap-2 ${isProfitable ? 'text-emerald-500' : 'text-rose-500'}`}>
              <span>{isProfitable ? '+' : ''}₹{Math.abs(profitOrLoss).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
            </div>
            <p className={`text-sm font-medium mt-1 ${isProfitable ? 'text-emerald-500' : 'text-rose-500'}`}>
              {isProfitable ? '+' : ''}{returnPercentage.toFixed(2)}%
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Investment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground text-sm">Status</span>
              <span className="font-medium">{investment.status}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground text-sm">Created At</span>
              <span className="font-medium">{format(parseISO(investment.systemCreatedAt), 'MMM dd, yyyy')}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground text-sm">Last Updated</span>
              <span className="font-medium">{format(parseISO(investment.systemModifiedAt), 'MMM dd, yyyy')}</span>
            </div>
            
            {investment.notes && (
              <div className="pt-2">
                <span className="text-muted-foreground text-sm block mb-1">Notes</span>
                <p className="text-sm bg-secondary/50 p-3 rounded-md">{investment.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
