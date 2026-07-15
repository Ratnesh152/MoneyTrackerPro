/**
 * Amortization Schedule Generator
 * Pure TypeScript — no Next.js or Business Central dependencies.
 *
 * Uses the stored EMI amount as the source of truth (not the recalculated formula),
 * which accurately mirrors what the bank charges each month.
 */

import { calculateMonthlyInterestRate } from './emi';
import { calculateInterestComponent, calculatePrincipalComponent } from './interest';

/**
 * A single row in the amortization schedule.
 */
export interface AmortizationRow {
  /** EMI number, 1-based (i.e. payment number) */
  month: number;
  /** ISO date string of the scheduled payment date */
  date: string;
  /** Total EMI amount for this period */
  emi: number;
  /** Principal component (reduces outstanding) */
  principal: number;
  /** Interest component (cost of borrowing) */
  interest: number;
  /** Outstanding principal after this payment */
  outstanding: number;
}

/**
 * Generates the full amortization schedule for a loan.
 *
 * Design decisions:
 * - Uses `storedEmi` (from BC) as the EMI, not the recalculated formula value,
 *   to match the bank's actual billing.
 * - The last payment is adjusted to pay off any remaining balance exactly,
 *   preventing floating-point drift from leaving a tiny residual.
 * - All values are rounded to 2 decimal places.
 *
 * @param principal    - Original loan principal (P)
 * @param annualRate   - Annual interest rate in percent (e.g. 8.75)
 * @param storedEmi    - EMI amount stored on the loan record (source of truth)
 * @param startDate    - Loan start date (ISO string, e.g. "2022-04-01")
 * @param tenureMonths - Total tenure in months
 * @returns Array of AmortizationRow, one per month
 */
export function generateAmortizationSchedule(
  principal: number,
  annualRate: number,
  storedEmi: number,
  startDate: string,
  tenureMonths: number
): AmortizationRow[] {
  if (principal <= 0 || tenureMonths <= 0) return [];

  const monthlyRate = calculateMonthlyInterestRate(annualRate);
  const schedule: AmortizationRow[] = [];
  let outstanding = principal;

  const start = new Date(startDate);

  for (let month = 1; month <= tenureMonths; month++) {
    // Payment date = start date + month months
    const paymentDate = new Date(start.getFullYear(), start.getMonth() + month, start.getDate());

    const interest = calculateInterestComponent(outstanding, monthlyRate);
    let principalComp = calculatePrincipalComponent(storedEmi, interest);
    let emi = storedEmi;

    // Last payment: close off exact remaining balance to avoid float drift
    if (month === tenureMonths || principalComp >= outstanding) {
      principalComp = outstanding;
      emi = principalComp + interest;
    }

    outstanding = Math.max(0, outstanding - principalComp);

    schedule.push({
      month,
      date: paymentDate.toISOString().split('T')[0],
      emi: Math.round(emi * 100) / 100,
      principal: Math.round(principalComp * 100) / 100,
      interest: Math.round(interest * 100) / 100,
      outstanding: Math.round(outstanding * 100) / 100,
    });
  }

  return schedule;
}
