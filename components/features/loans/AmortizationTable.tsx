'use client';

import { useState, useCallback } from 'react';
import type { AmortizationRow } from '@/types/loan-analytics.types';
import type { Loan } from '@/types/loan.types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Download, Printer, ChevronLeft, ChevronRight } from 'lucide-react';

interface AmortizationTableProps {
  schedule: AmortizationRow[];
  loan: Loan;
  currentMonth: number;  // monthsElapsed — used to highlight the current row
}

const ROWS_PER_PAGE = 12; // 1 year per page

const fmt = (n: number, currency: string) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency || 'INR',
    maximumFractionDigits: 0,
  }).format(n);

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

/* ── CSV Export ─────────────────────────────────────────────────────────── */
function exportCSV(schedule: AmortizationRow[], loan: Loan) {
  const headers = ['EMI No', 'Date', 'EMI Amount', 'Principal', 'Interest', 'Outstanding'];
  const rows = schedule.map((r) => [
    r.month,
    r.date,
    r.emi.toFixed(2),
    r.principal.toFixed(2),
    r.interest.toFixed(2),
    r.outstanding.toFixed(2),
  ]);

  const csvContent = [
    // Metadata rows
    [`Loan Name,${loan.loanName}`],
    [`Lender,${loan.lenderName}`],
    [`Principal,${loan.principalAmount}`],
    [`Annual Rate,${loan.interestRate}%`],
    [`Tenure,${loan.tenureMonths} months`],
    [`EMI,${loan.emiAmount}`],
    [],
    headers,
    ...rows,
  ]
    .map((row) => row.join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${loan.loanName.replace(/\s+/g, '_')}_amortization.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ── Print ───────────────────────────────────────────────────────────────── */
function handlePrint() {
  window.print();
}

/* ── Component ────────────────────────────────────────────────────────────── */
export function AmortizationTable({ schedule, loan, currentMonth }: AmortizationTableProps) {
  const [page, setPage] = useState(0);
  const currency = loan.currencyCode || 'INR';
  const totalPages = Math.ceil(schedule.length / ROWS_PER_PAGE);
  const pageRows = schedule.slice(page * ROWS_PER_PAGE, (page + 1) * ROWS_PER_PAGE);

  const handleExportCSV = useCallback(() => exportCSV(schedule, loan), [schedule, loan]);

  return (
    <Card className="border shadow-sm print:shadow-none">
      <CardHeader className="flex flex-row items-center justify-between pb-3 print:hidden">
        <div>
          <CardTitle className="text-base font-semibold">Amortization Schedule</CardTitle>
          <p className="text-xs text-muted-foreground">
            {schedule.length} payments · generated dynamically
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-1.5">
            <Download className="h-4 w-4" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5">
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Print-only header */}
        <div className="hidden p-4 print:block">
          <h2 className="text-lg font-bold">{loan.loanName} — Amortization Schedule</h2>
          <p className="text-sm text-gray-600">
            {loan.lenderName} · {loan.interestRate}% p.a. · {loan.tenureMonths} months
          </p>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-16 text-center">#</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">EMI</TableHead>
                <TableHead className="text-right">Principal</TableHead>
                <TableHead className="text-right">Interest</TableHead>
                <TableHead className="text-right">Outstanding</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="print:hidden">
              {pageRows.map((row) => {
                const isPaid = row.month <= currentMonth;
                const isCurrent = row.month === currentMonth + 1;

                return (
                  <TableRow
                    key={row.month}
                    className={
                      isCurrent
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 font-medium'
                        : isPaid
                        ? 'text-muted-foreground'
                        : ''
                    }
                  >
                    <TableCell className="text-center text-sm">
                      <span className={isCurrent ? 'rounded-full bg-emerald-500 px-2 py-0.5 text-xs text-white' : ''}>
                        {row.month}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{fmtDate(row.date)}</TableCell>
                    <TableCell className="text-right text-sm">{fmt(row.emi, currency)}</TableCell>
                    <TableCell className="text-right text-sm font-medium text-blue-600 dark:text-blue-400">
                      {fmt(row.principal, currency)}
                    </TableCell>
                    <TableCell className="text-right text-sm text-amber-600 dark:text-amber-400">
                      {fmt(row.interest, currency)}
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium">
                      {fmt(row.outstanding, currency)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>

            {/* Print: show all rows */}
            <TableBody className="hidden print:table-row-group">
              {schedule.map((row) => (
                <TableRow key={row.month}>
                  <TableCell className="text-center text-xs">{row.month}</TableCell>
                  <TableCell className="text-xs">{fmtDate(row.date)}</TableCell>
                  <TableCell className="text-right text-xs">{fmt(row.emi, currency)}</TableCell>
                  <TableCell className="text-right text-xs">{fmt(row.principal, currency)}</TableCell>
                  <TableCell className="text-right text-xs">{fmt(row.interest, currency)}</TableCell>
                  <TableCell className="text-right text-xs">{fmt(row.outstanding, currency)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3 print:hidden">
            <p className="text-xs text-muted-foreground">
              Showing EMIs {page * ROWS_PER_PAGE + 1}–
              {Math.min((page + 1) * ROWS_PER_PAGE, schedule.length)} of {schedule.length}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs">
                {page + 1} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                disabled={page === totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
