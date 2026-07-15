'use client';

import React from 'react';
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer 
} from 'recharts';
import { DashboardCard } from '../shared/DashboardCard';
import { DashboardCategorySummary } from '@/types/dashboard.types';

interface ExpenseCategoryChartProps {
  data: DashboardCategorySummary[];
}

const DEFAULT_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export function ExpenseCategoryChart({ data }: ExpenseCategoryChartProps) {
  if (data.length === 0) {
    return (
      <DashboardCard title="Expense Categories" description="Current month breakdown" className="lg:col-span-1">
        <div className="h-[300px] w-full mt-4 flex items-center justify-center text-muted-foreground text-sm">
          No expenses recorded this month
        </div>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard title="Expense Categories" description="Current month breakdown" className="lg:col-span-1">
      <div className="h-[300px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="amount"
              label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.colorCode || DEFAULT_COLORS[index % DEFAULT_COLORS.length]} />
              ))}
            </Pie>
            <RechartsTooltip 
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any) => `$${Number(value || 0).toFixed(2)}`}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </DashboardCard>
  );
}
