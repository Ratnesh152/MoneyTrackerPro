"use client";

import React, { useMemo } from 'react';
import { RecurringFrequency } from '@/types/recurring-transaction.types';
import { parseISO, addDays, addWeeks, addMonths, addYears, format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface RecurringSchedulePreviewProps {
  startDate: string;
  endDate?: string;
  frequency: RecurringFrequency;
  interval: number;
  amount: number;
  maxOccurrences?: number;
}

export function RecurringSchedulePreview({
  startDate,
  endDate,
  frequency,
  interval,
  amount,
  maxOccurrences = 12
}: RecurringSchedulePreviewProps) {
  
  const schedule = useMemo(() => {
    if (!startDate || !frequency || !interval || interval < 1 || !amount || amount <= 0) {
      return [];
    }

    try {
      const dates: { index: number; date: Date; amount: number }[] = [];
      let current = parseISO(startDate);
      const end = endDate ? parseISO(endDate) : null;
      let count = 0;

      while (count < maxOccurrences) {
        if (end && current > end) {
          break;
        }

        dates.push({
          index: count + 1,
          date: current,
          amount: amount
        });

        count++;

        // Calculate next date
        switch (frequency) {
          case 'Daily':
            current = addDays(current, interval);
            break;
          case 'Weekly':
            current = addWeeks(current, interval);
            break;
          case 'BiWeekly':
            current = addWeeks(current, interval * 2);
            break;
          case 'Monthly':
            current = addMonths(current, interval);
            break;
          case 'Quarterly':
            current = addMonths(current, interval * 3);
            break;
          case 'HalfYearly':
            current = addMonths(current, interval * 6);
            break;
          case 'Yearly':
            current = addYears(current, interval);
            break;
        }
      }

      return dates;
    } catch (e) {
      return [];
    }
  }, [startDate, endDate, frequency, interval, amount, maxOccurrences]);

  if (schedule.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 border rounded-md overflow-hidden">
      <div className="bg-muted px-4 py-2 text-sm font-semibold border-b">
        Schedule Preview (Next {schedule.length} Occurrences)
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">#</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schedule.map((row) => (
            <TableRow key={row.index}>
              <TableCell className="font-medium">{row.index}</TableCell>
              <TableCell>{format(row.date, 'dd MMM yyyy')}</TableCell>
              <TableCell className="text-right font-medium text-destructive">
                ₹{row.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
