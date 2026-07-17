"use client";

import React from 'react';
import { UpcomingItem } from '@/types/dashboard.types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import { CalendarClock, ArrowRightCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export function UpcomingItems({ items }: { items: UpcomingItem[] }) {
  
  const getRelativeDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isToday(d)) return 'Today';
    if (isTomorrow(d)) return 'Tomorrow';
    if (isPast(d)) return 'Overdue';
    return format(d, 'MMM d, yyyy');
  };

  const isOverdue = (dateStr: string) => {
    return isPast(new Date(dateStr)) && !isToday(new Date(dateStr));
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-primary" />
            Upcoming Bills & Income
          </CardTitle>
          <Link href="/recurring-transactions" className="text-sm text-primary hover:underline flex items-center gap-1">
            View All <ArrowRightCircle className="h-4 w-4" />
          </Link>
        </div>
        <CardDescription>Scheduled for the next 7 days</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[150px] text-muted-foreground text-sm text-center">
            <CalendarClock className="h-8 w-8 mb-2 opacity-20" />
            No upcoming items in the next 7 days.
          </div>
        ) : (
          <div className="space-y-4 mt-2">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`p-2 rounded-full shrink-0 ${isOverdue(item.date) ? 'bg-destructive/10' : 'bg-primary/10'}`}>
                    {isOverdue(item.date) ? (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    ) : (
                      <CalendarClock className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="font-medium text-sm truncate">{item.title}</span>
                    <span className={`text-xs ${isOverdue(item.date) ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                      {getRelativeDate(item.date)}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end shrink-0 pl-2">
                  <span className="font-semibold text-sm">
                    ₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                  <Badge variant="outline" className="text-[10px] mt-1 h-4 px-1 py-0 font-normal">
                    {item.type}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
