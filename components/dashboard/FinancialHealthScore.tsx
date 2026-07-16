import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FinancialHealth } from '@/types/dashboard.types';
import { Activity } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export function FinancialHealthScore({ data }: { data: FinancialHealth }) {
  let color = 'text-primary';
  let progressColor = 'bg-primary';

  switch (data.status) {
    case 'Excellent':
      color = 'text-emerald-500';
      progressColor = 'bg-emerald-500';
      break;
    case 'Good':
      color = 'text-blue-500';
      progressColor = 'bg-blue-500';
      break;
    case 'Needs Attention':
      color = 'text-amber-500';
      progressColor = 'bg-amber-500';
      break;
    case 'Critical':
      color = 'text-rose-500';
      progressColor = 'bg-rose-500';
      break;
  }

  return (
    <Card className="col-span-full md:col-span-1 lg:col-span-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Financial Health</CardTitle>
        <Activity className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-4">
          <div className={`text-5xl font-bold ${color}`}>{data.score}</div>
          <div className="text-sm font-medium mt-2">{data.status}</div>
          
          <div className="w-full mt-6">
            <Progress value={data.score} className="h-2" indicatorClassName={progressColor} />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1 px-1">
              <span>0</span>
              <span>100</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
