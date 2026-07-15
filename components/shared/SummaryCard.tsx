import React from 'react';
import { cn } from '@/lib/utils';

interface SummaryCardProps {
  title: string;
  amount: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

export function SummaryCard({ title, amount, icon, trend, className }: SummaryCardProps) {
  return (
    <div className={cn("rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col", className)}>
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="tracking-tight text-sm font-medium text-muted-foreground">{title}</h3>
        <div className="text-muted-foreground bg-muted p-2 rounded-full">
          {icon}
        </div>
      </div>
      <div className="flex flex-col">
        <div className="text-2xl font-bold">{amount}</div>
        {trend && (
          <p className="text-xs mt-1">
            <span className={trend.isPositive ? "text-emerald-500 font-medium" : "text-rose-500 font-medium"}>
              {trend.isPositive ? '+' : '-'}{trend.value}
            </span>
            <span className="text-muted-foreground ml-1">from last month</span>
          </p>
        )}
      </div>
    </div>
  );
}
