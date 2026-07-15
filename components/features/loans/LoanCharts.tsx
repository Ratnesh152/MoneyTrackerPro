'use client';

import type { LoanAnalytics } from '@/types/loan-analytics.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface LoanChartsProps {
  analytics: LoanAnalytics;
}

const COLORS = {
  principal: '#3b82f6',  // blue-500
  interest:  '#f59e0b',  // amber-500
  remaining: '#e5e7eb',  // gray-200
  line:      '#6366f1',  // indigo-500
};

const fmtINR = (v: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(v);

/* ── 1. Principal vs Interest Pie Chart ─────────────────────────────────── */

function PrincipalVsInterestChart({ analytics }: LoanChartsProps) {
  const { loan, totalInterest } = analytics;
  const data = [
    { name: 'Principal', value: loan.principalAmount },
    { name: 'Total Interest', value: totalInterest },
  ];

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Principal vs Interest</CardTitle>
        <p className="text-xs text-muted-foreground">
          Total cost breakdown over {loan.tenureMonths} months
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
            >
              <Cell fill={COLORS.principal} />
              <Cell fill={COLORS.interest} />
            </Pie>
            <Tooltip
              formatter={(value) => [typeof value === 'number' ? fmtINR(value) : '—']}
              contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
            />
            <Legend
              iconType="circle"
              iconSize={10}
              formatter={(value) => (
                <span className="text-xs text-foreground">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

/* ── 2. Outstanding Principal Trend Line Chart ───────────────────────────── */

function OutstandingTrendChart({ analytics }: LoanChartsProps) {
  const { schedule, monthsElapsed, loan } = analytics;

  // Sample every 6 months to keep the chart clean (for long tenures)
  const step = Math.max(1, Math.floor(loan.tenureMonths / 24));
  const chartData = schedule
    .filter((_, i) => i % step === 0 || i === schedule.length - 1)
    .map((row) => ({
      month: row.month,
      outstanding: row.outstanding,
      isCurrent: Math.abs(row.month - monthsElapsed) <= step / 2,
    }));

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Outstanding Principal Trend</CardTitle>
        <p className="text-xs text-muted-foreground">
          How your principal reduces over time
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <XAxis
              dataKey="month"
              tickFormatter={(v) => `M${v}`}
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tickFormatter={fmtINR}
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={60}
            />
            <Tooltip
              formatter={(value) => [typeof value === 'number' ? fmtINR(value) : '—', 'Outstanding']}
              labelFormatter={(label) => `Month ${label}`}
              contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
            />
            {monthsElapsed > 0 && monthsElapsed < loan.tenureMonths && (
              <ReferenceLine
                x={monthsElapsed}
                stroke="#10b981"
                strokeDasharray="4 3"
                label={{ value: 'Today', position: 'top', fontSize: 11, fill: '#10b981' }}
              />
            )}
            <Line
              type="monotone"
              dataKey="outstanding"
              stroke={COLORS.line}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

/* ── 3. Loan Completion Radial Chart ─────────────────────────────────────── */

function LoanCompletionRadial({ analytics }: LoanChartsProps) {
  const { progressPercent, loan } = analytics;

  const data = [
    { name: 'Progress', value: progressPercent, fill: '#10b981' },
    { name: 'Remaining', value: 100 - progressPercent, fill: '#e5e7eb' },
  ];

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Loan Completion</CardTitle>
        <p className="text-xs text-muted-foreground">
          {analytics.monthsElapsed} of {loan.tenureMonths} EMIs paid
        </p>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="relative">
          <ResponsiveContainer width={200} height={200}>
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              startAngle={90}
              endAngle={-270}
              data={data}
            >
              <RadialBar dataKey="value" cornerRadius={8} background={{ fill: '#f3f4f6' }} />
            </RadialBarChart>
          </ResponsiveContainer>
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-emerald-600">
              {progressPercent.toFixed(0)}%
            </span>
            <span className="text-xs text-muted-foreground">repaid</span>
          </div>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {analytics.remainingMonths > 0
            ? `${analytics.remainingMonths} months remaining`
            : 'Loan fully repaid!'}
        </p>
      </CardContent>
    </Card>
  );
}

/* ── Main Export ─────────────────────────────────────────────────────────── */

export function LoanCharts({ analytics }: LoanChartsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <PrincipalVsInterestChart analytics={analytics} />
      <OutstandingTrendChart analytics={analytics} />
      <LoanCompletionRadial analytics={analytics} />
    </div>
  );
}
