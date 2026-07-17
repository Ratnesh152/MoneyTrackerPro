"use client";

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Investment } from '@/types/investment.types';
import { InvestmentDialog } from './InvestmentDialog';
import { Button } from '@/components/ui/button';
import { Edit2, Eye, TrendingDown, TrendingUp } from 'lucide-react';
import { investmentAnalyticsService } from '@/services/investment-analytics.service';
import Link from 'next/link';

interface InvestmentTableProps {
  investments: Investment[];
}

export function InvestmentTable({ investments }: InvestmentTableProps) {
  if (investments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-card text-card-foreground shadow-sm">
        <h3 className="text-lg font-semibold">No investments found</h3>
        <p className="text-muted-foreground mt-1 mb-4">You haven't added any investments yet.</p>
        <InvestmentDialog />
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Invested</TableHead>
            <TableHead className="text-right">Current Value</TableHead>
            <TableHead className="text-right">Return</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {investments.map((inv) => {
            const { profitOrLoss, returnPercentage, isProfitable } = investmentAnalyticsService.calculateAnalytics(inv);
            
            return (
              <TableRow key={inv.systemId}>
                <TableCell className="font-medium">{inv.name}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-secondary text-secondary-foreground">
                    {inv.type.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  ₹{inv.investedAmount.toLocaleString('en-IN')}
                </TableCell>
                <TableCell className="text-right font-medium">
                  ₹{inv.currentValue.toLocaleString('en-IN')}
                </TableCell>
                <TableCell className="text-right">
                  <div className={`flex items-center justify-end ${isProfitable ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {isProfitable ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingDown className="mr-1 h-3 w-3" />}
                    <span>{profitOrLoss > 0 ? '+' : ''}₹{Math.abs(profitOrLoss).toLocaleString('en-IN')}</span>
                    <span className="text-xs ml-1 opacity-80">({returnPercentage.toFixed(1)}%)</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    inv.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 
                    inv.status === 'Matured' ? 'bg-blue-500/10 text-blue-500' : 
                    'bg-slate-500/10 text-slate-500'
                  }`}>
                    {inv.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="p-0">
                      <Link href={`/investments/${inv.systemId}`} className="h-full w-full flex items-center justify-center">
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Link>
                    </Button>
                    <InvestmentDialog
                      investment={inv}
                      trigger={
                        <Button variant="ghost" size="icon">
                          <Edit2 className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                      }
                    />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
