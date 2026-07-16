'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReceiptText, Building, CreditCard, Landmark, PieChart } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function QuickActions() {
  const router = useRouter();

  return (
    <Card className="col-span-full md:col-span-1 h-full">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
        <CardDescription>Common tasks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
          <Button variant="outline" className="flex justify-start gap-3 h-auto py-3 px-3" onClick={() => router.push('/transactions')}>
            <ReceiptText className="h-4 w-4 text-primary" />
            <span className="font-medium text-sm text-foreground">Transaction</span>
          </Button>

          <Button variant="outline" className="flex justify-start gap-3 h-auto py-3 px-3" onClick={() => router.push('/loans')}>
            <Landmark className="h-4 w-4 text-emerald-500" />
            <span className="font-medium text-sm text-foreground">Record EMI</span>
          </Button>

          <Button variant="outline" className="flex justify-start gap-3 h-auto py-3 px-3" onClick={() => router.push('/credit-cards')}>
            <CreditCard className="h-4 w-4 text-amber-500" />
            <span className="font-medium text-sm text-foreground">Pay Card</span>
          </Button>

          <Button variant="outline" className="flex justify-start gap-3 h-auto py-3 px-3" onClick={() => router.push('/budgets')}>
            <PieChart className="h-4 w-4 text-purple-500" />
            <span className="font-medium text-sm text-foreground">Budget</span>
          </Button>

          <Button variant="outline" className="flex justify-start gap-3 h-auto py-3 px-3 sm:col-span-2 lg:col-span-1 xl:col-span-2" onClick={() => router.push('/accounts')}>
            <Building className="h-4 w-4 text-blue-500" />
            <span className="font-medium text-sm text-foreground">Account</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
