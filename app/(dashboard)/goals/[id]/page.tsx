import React from 'react';
import { savingsGoalService } from '@/services/business-central/goal.service';
import { goalAnalyticsService } from '@/services/goal-analytics.service';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { GoalProgressCard } from '@/components/features/goals/GoalProgressCard';
import { GoalCharts } from '@/components/features/goals/GoalCharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface GoalDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function GoalDetailsPage({ params }: GoalDetailsPageProps) {
  const session = await auth();
  if (!session?.user?.id || !session?.accessToken) {
    redirect('/login');
  }

  const { id } = await params;
  const goal = await savingsGoalService.getSavingsGoalById(id, session.accessToken);

  if (!goal || goal.ownerEntraObjectId !== session.user.id) {
    redirect('/goals');
  }

  const analytics = goalAnalyticsService.calculateAnalytics(goal);

  return (
    <div className="container mx-auto py-10 max-w-7xl space-y-8">
      <div className="flex items-center space-x-4">
        <Link href="/goals">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{goal.goalName}</h2>
          <div className="flex items-center space-x-2 mt-1">
            <Badge variant="outline">{goal.goalType.replace(/([A-Z])/g, ' $1').trim()}</Badge>
            <Badge variant={goal.status === 'Active' ? 'default' : goal.status === 'Completed' ? 'secondary' : 'destructive'}>
              {goal.status}
            </Badge>
          </div>
        </div>
      </div>

      <GoalProgressCard analytics={analytics} targetAmount={goal.targetAmount} />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Goal Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground font-medium">Target Amount</p>
                <p>₹{goal.targetAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
              </div>
              <div>
                <p className="text-muted-foreground font-medium">Current Saved</p>
                <p className="text-emerald-500 font-medium">₹{analytics.currentSaved.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
              </div>
              <div>
                <p className="text-muted-foreground font-medium">Configured Monthly</p>
                <p>₹{goal.monthlyContribution.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
              </div>
              <div>
                <p className="text-muted-foreground font-medium">Auto Contribute</p>
                <p>{goal.autoContribute ? 'Yes' : 'No'}</p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm font-medium">{Math.round(analytics.progressPercentage)}%</span>
              </div>
              <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                <div 
                  className={`h-full ${analytics.progressPercentage >= 100 ? 'bg-emerald-500' : 'bg-primary'}`} 
                  style={{ width: `${analytics.progressPercentage}%` }} 
                />
              </div>
            </div>

            {goal.notes && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground font-medium mb-1">Notes</p>
                <p className="text-sm">{goal.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <GoalCharts analytics={analytics} targetAmount={goal.targetAmount} />
      </div>
    </div>
  );
}
