"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, ArrowRight, PieChart } from 'lucide-react';
import { Investment } from '@/types/investment.types';
import { investmentAnalyticsService } from '@/services/investment-analytics.service';
import Link from 'next/link';

interface InvestmentSummaryCardProps {
  investments: Investment[];
}

export function InvestmentSummaryCard({ investments }: InvestmentSummaryCardProps) {
  const { totalCurrentValue, totalProfitOrLoss, totalReturnPercentage, allocation } = investmentAnalyticsService.calculatePortfolioAnalytics(investments);
  
  const isProfitable = totalProfitOrLoss >= 0;
  const activeInvestmentsCount = investments.filter(i => i.status === 'Active').length;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <PieChart className="h-4 w-4 text-purple-500" />
          Investments
        </CardTitle>
        <Link href="/investments" className="text-xs text-primary hover:underline flex items-center">
          View all <ArrowRight className="h-3 w-3 ml-1" />
        </Link>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold">
                ₹{totalCurrentValue.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
              <div className={`flex items-center text-sm font-medium ${isProfitable ? 'text-emerald-500' : 'text-rose-500'}`}>
                {isProfitable ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                {totalReturnPercentage.toFixed(1)}%
              </div>
            </div>
            
            <div className="mt-3 text-xs text-muted-foreground">
              Total returns: <span className={isProfitable ? 'text-emerald-500 font-medium' : 'text-rose-500 font-medium'}>
                {isProfitable ? '+' : ''}₹{Math.abs(totalProfitOrLoss).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>

          {allocation.length > 0 && (
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium">Top Allocation</span>
              </div>
              <div className="flex flex-col space-y-2">
                {allocation.slice(0, 2).map((item, idx) => {
                  const percentage = totalCurrentValue > 0 ? (item.value / totalCurrentValue) * 100 : 0;
                  return (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <span className="truncate max-w-[120px] text-muted-foreground">{item.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">₹{item.value.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                        <span className="text-muted-foreground w-8 text-right">{percentage.toFixed(0)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          <div className="text-xs text-muted-foreground pt-2 border-t">
            {activeInvestmentsCount} active {activeInvestmentsCount === 1 ? 'investment' : 'investments'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
