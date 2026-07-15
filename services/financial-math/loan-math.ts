/**
 * High-level Loan Math Utilities
 * Pure TypeScript — no Next.js or Business Central dependencies.
 *
 * Derives all computed loan analytics from the 5 stored fields:
 *   principalAmount, interestRate, emiAmount, tenureMonths, startDate
 */

import type { AmortizationRow } from './amortization';

/**
 * Calculates the number of full months elapsed since the loan start date.
 * Capped between 0 and tenureMonths.
 */
export function calculateMonthsElapsed(
  startDate: string,
  tenureMonths: number
): number {
  const start = new Date(startDate);
  const now = new Date();
  const elapsed =
    (now.getFullYear() - start.getFullYear()) * 12 +
    (now.getMonth() - start.getMonth());
  return Math.max(0, Math.min(elapsed, tenureMonths));
}

/**
 * Calculates the outstanding principal after `monthsElapsed` payments.
 * Uses the generated schedule to derive the exact value.
 *
 * @param schedule      - Full amortization schedule (from generateAmortizationSchedule)
 * @param monthsElapsed - Number of EMIs already paid
 */
export function calculateOutstandingPrincipal(
  schedule: AmortizationRow[],
  monthsElapsed: number
): number {
  if (monthsElapsed <= 0) {
    // No payments made yet — outstanding = full principal (row 0's outstanding + its principal component)
    const firstRow = schedule[0];
    if (!firstRow) return 0;
    return Math.round((firstRow.outstanding + firstRow.principal) * 100) / 100;
  }
  const row = schedule[Math.min(monthsElapsed, schedule.length) - 1];
  return row?.outstanding ?? 0;
}

/**
 * Calculates the total interest payable over the full loan tenure.
 *
 * @param emiAmount    - Monthly EMI (stored)
 * @param tenureMonths - Total tenure
 * @param principal    - Original principal
 */
export function calculateTotalInterest(
  emiAmount: number,
  tenureMonths: number,
  principal: number
): number {
  return Math.max(0, Math.round((emiAmount * tenureMonths - principal) * 100) / 100);
}

/**
 * Calculates how much interest remains to be paid (from current month onwards).
 *
 * @param schedule      - Full amortization schedule
 * @param monthsElapsed - Number of EMIs already paid
 */
export function calculateRemainingInterest(
  schedule: AmortizationRow[],
  monthsElapsed: number
): number {
  return Math.round(
    schedule
      .slice(monthsElapsed)
      .reduce((sum, row) => sum + row.interest, 0) * 100
  ) / 100;
}

/**
 * Calculates the loan repayment progress as a percentage (0–100).
 * For Closed loans, always returns 100.
 *
 * @param monthsElapsed - Number of EMIs already paid
 * @param tenureMonths  - Total tenure
 * @param status        - 'Active' | 'Closed'
 */
export function calculateLoanProgress(
  monthsElapsed: number,
  tenureMonths: number,
  status: string
): number {
  if (status === 'Closed') return 100;
  if (tenureMonths <= 0) return 0;
  return Math.min(100, Math.round((monthsElapsed / tenureMonths) * 10000) / 100);
}

/**
 * Calculates the number of remaining EMI payments.
 */
export function calculateRemainingMonths(
  tenureMonths: number,
  monthsElapsed: number,
  status: string
): number {
  if (status === 'Closed') return 0;
  return Math.max(0, tenureMonths - monthsElapsed);
}

/**
 * Returns the ISO date string of the next EMI due date.
 * Returns null for Closed loans or fully-repaid active loans.
 *
 * @param startDate     - Loan start date (ISO string)
 * @param monthsElapsed - Number of EMIs already paid
 * @param tenureMonths  - Total tenure
 * @param status        - 'Active' | 'Closed'
 */
export function getNextEMIDate(
  startDate: string,
  monthsElapsed: number,
  tenureMonths: number,
  status: string
): string | null {
  if (status === 'Closed' || monthsElapsed >= tenureMonths) return null;
  const start = new Date(startDate);
  const next = new Date(start.getFullYear(), start.getMonth() + monthsElapsed + 1, start.getDate());
  return next.toISOString().split('T')[0];
}

/**
 * Sums the principal and interest paid so far from the schedule.
 */
export function calculateAmountsPaid(
  schedule: AmortizationRow[],
  monthsElapsed: number
): { principalPaid: number; interestPaid: number } {
  const paidRows = schedule.slice(0, monthsElapsed);
  const principalPaid = Math.round(paidRows.reduce((s, r) => s + r.principal, 0) * 100) / 100;
  const interestPaid = Math.round(paidRows.reduce((s, r) => s + r.interest, 0) * 100) / 100;
  return { principalPaid, interestPaid };
}
