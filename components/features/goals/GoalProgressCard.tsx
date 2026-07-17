"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GoalAnalytics } from '@/types/goal.types';
import { Target, TrendingUp, Calendar, AlertCircle } from 'lucide-react';

interface GoalProgressCardProps {
  analytics: GoalAnalytics;
  targetAmount: number;
}

export function GoalProgressCard({ analytics, targetAmount }: GoalProgressCardProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Target Amount</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹{targetAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Remaining Amount</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹{analytics.remainingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          <p className="text-xs text-muted-foreground">
            {analytics.progressPercentage >= 100 ? 'Goal Reached!' : `${Math.round(analytics.progressPercentage)}% completed`}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Required</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹{analytics.monthlyRequired.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          <p className={`text-xs ${analytics.isOnTrack ? 'text-emerald-500' : 'text-destructive'}`}>
            {analytics.isOnTrack ? 'You are on track' : 'You are falling behind target'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Est. Completion</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {analytics.estimatedCompletionDate 
              ? new Date(analytics.estimatedCompletionDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
              : '-'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
