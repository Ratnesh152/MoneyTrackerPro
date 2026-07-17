"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Investment } from '@/types/investment.types';
import { investmentAnalyticsService } from '@/services/investment-analytics.service';
import { TrendingDown, TrendingUp, Wallet, Banknote, LineChart, AlertCircle } from 'lucide-react';

interface InvestmentProgressCardProps {
  investments: Investment[];
}

export function InvestmentProgressCard({ investments }: InvestmentProgressCardProps) {
  const {
    totalInvested,
    totalCurrentValue,
    totalProfitOrLoss,
    totalReturnPercentage,
  } = investmentAnalyticsService.calculatePortfolioAnalytics(investments);

  const isProfitable = totalProfitOrLoss >= 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹{totalInvested.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Principal amount invested
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Value</CardTitle>
          <Banknote className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹{totalCurrentValue.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Present value of active investments
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Profit / Loss</CardTitle>
          {isProfitable ? (
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-rose-500" />
          )}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${isProfitable ? 'text-emerald-500' : 'text-rose-500'}`}>
            {isProfitable ? '+' : ''}₹{Math.abs(totalProfitOrLoss).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Total absolute return
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Return %</CardTitle>
          <LineChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${isProfitable ? 'text-emerald-500' : 'text-rose-500'}`}>
            {isProfitable ? '+' : ''}{totalReturnPercentage.toFixed(2)}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Overall portfolio growth
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
