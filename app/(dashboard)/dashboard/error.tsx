'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard Error:', error);
  }, [error]);

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center space-y-4 p-4 text-center">
      <div className="rounded-full bg-destructive/10 p-4">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Dashboard unavailable</h2>
        <p className="text-muted-foreground max-w-[500px]">
          We couldn't load your financial overview. Please check your connection or try again later.
        </p>
        <p className="text-sm font-mono text-destructive mt-4 bg-destructive/10 p-2 rounded max-w-[500px] overflow-auto">
          {error.message || 'Unknown error'}
        </p>
      </div>
      <div className="flex space-x-4">
        <Button onClick={reset} variant="default">
          Try again
        </Button>
      </div>
    </div>
  );
}
