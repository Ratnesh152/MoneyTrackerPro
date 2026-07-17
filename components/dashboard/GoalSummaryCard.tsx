"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, ArrowRight } from 'lucide-react';
import { SavingsGoal } from '@/types/goal.types';
import { goalAnalyticsService } from '@/services/goal-analytics.service';
import Link from 'next/link';

interface GoalSummaryCardProps {
  goals: SavingsGoal[];
}

export function GoalSummaryCard({ goals }: GoalSummaryCardProps) {
  const { totalTarget, totalSaved, totalProgressPercentage } = goalAnalyticsService.calculateTotalAnalytics(goals);
  
  const activeGoalsCount = goals.filter(g => g.status === 'Active').length;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Target className="h-4 w-4 text-emerald-500" />
          Savings Goals
        </CardTitle>
        <Link href="/goals" className="text-xs text-primary hover:underline flex items-center">
          View all <ArrowRight className="h-3 w-3 ml-1" />
        </Link>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold">
                ₹{totalSaved.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
              <span className="text-sm text-muted-foreground mb-1">
                of ₹{totalTarget.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
            </div>
            
            <div className="mt-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium">Total Progress</span>
                <span className="text-xs font-medium">{Math.round(totalProgressPercentage)}%</span>
              </div>
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div 
                  className={`h-full ${totalProgressPercentage >= 100 ? 'bg-emerald-500' : 'bg-primary'}`} 
                  style={{ width: `${totalProgressPercentage}%` }} 
                />
              </div>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground pt-2 border-t">
            {activeGoalsCount} active {activeGoalsCount === 1 ? 'goal' : 'goals'} tracking
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
