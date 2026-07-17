"use client";

import React from 'react';
import { GoalAnalytics } from '@/types/goal.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface GoalChartsProps {
  analytics: GoalAnalytics;
  targetAmount: number;
}

export function GoalCharts({ analytics, targetAmount }: GoalChartsProps) {
  const data = [
    { name: 'Saved', value: analytics.currentSaved, color: '#10b981' },
    { name: 'Remaining', value: analytics.remainingAmount, color: '#e2e8f0' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Remaining vs Saved</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any) => `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
