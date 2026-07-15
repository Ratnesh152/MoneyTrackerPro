'use client';

import React from 'react';
import { DashboardCard } from '../shared/DashboardCard';
import { Button } from '@/components/ui/button';
import { ReceiptText, Building, Grid } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function QuickActions() {
  const router = useRouter();

  return (
    <DashboardCard title="Quick Actions" description="Fast track">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
        <Button 
          variant="outline" 
          className="flex items-center gap-2 h-auto py-4"
          onClick={() => router.push('/transactions')}
        >
          <div className="bg-primary/10 p-2 rounded-full text-primary">
            <ReceiptText className="h-4 w-4" />
          </div>
          <div className="flex flex-col items-start text-left">
            <span className="font-semibold text-sm">Transaction</span>
            <span className="text-xs text-muted-foreground font-normal">Add new</span>
          </div>
        </Button>

        <Button 
          variant="outline" 
          className="flex items-center gap-2 h-auto py-4"
          onClick={() => router.push('/accounts')}
        >
          <div className="bg-primary/10 p-2 rounded-full text-primary">
            <Building className="h-4 w-4" />
          </div>
          <div className="flex flex-col items-start text-left">
            <span className="font-semibold text-sm">Account</span>
            <span className="text-xs text-muted-foreground font-normal">Create</span>
          </div>
        </Button>

        <Button 
          variant="outline" 
          className="flex items-center gap-2 h-auto py-4"
          onClick={() => router.push('/categories')}
        >
          <div className="bg-primary/10 p-2 rounded-full text-primary">
            <Grid className="h-4 w-4" />
          </div>
          <div className="flex flex-col items-start text-left">
            <span className="font-semibold text-sm">Category</span>
            <span className="text-xs text-muted-foreground font-normal">Create</span>
          </div>
        </Button>
      </div>
    </DashboardCard>
  );
}
