import type { Loan } from './loan.types';
import type { AmortizationRow } from '@/services/financial-math/amortization';

export type { AmortizationRow };

/**
 * Full computed analytics view model for a single loan.
 * Derived purely from the 5 stored fields — nothing is persisted.
 */
export interface LoanAnalytics {
  /** The source loan record from Business Central */
  loan: Loan;

  // ── Timing ─────────────────────────────────────────────────────────────────
  /** Number of full months elapsed since startDate (= EMIs paid so far) */
  monthsElapsed: number;
  /** Number of EMIs remaining (0 for Closed loans) */
  remainingMonths: number;
  /** ISO date of the next scheduled payment; null if Closed or fully paid */
  nextEMIDate: string | null;

  // ── Financials ─────────────────────────────────────────────────────────────
  /** Total interest payable over the full tenure (EMI × n − Principal) */
  totalInterest: number;
  /** Total amount payable over full tenure (Principal + Total Interest) */
  totalPayable: number;
  /** Principal component of all EMIs paid so far */
  principalPaid: number;
  /** Interest component of all EMIs paid so far */
  interestPaid: number;
  /** Current outstanding principal balance */
  outstandingPrincipal: number;
  /** Total interest still to be paid */
  remainingInterest: number;

  // ── Progress ───────────────────────────────────────────────────────────────
  /** Repayment progress as a percentage (0–100); 100 for Closed loans */
  progressPercent: number;

  // ── Schedule ───────────────────────────────────────────────────────────────
  /** Full amortization schedule — generated dynamically, never stored */
  schedule: AmortizationRow[];
}
