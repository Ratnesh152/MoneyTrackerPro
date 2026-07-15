/**
 * Loan Analytics Service
 *
 * Loads a loan from Business Central and computes all derived analytics
 * (amortization schedule, outstanding principal, progress %, etc.)
 * purely from the stored fields. Makes NO writes to Business Central.
 */

import { getLoan } from './business-central/loan.service';
import { generateAmortizationSchedule } from './financial-math/amortization';
import {
  calculateMonthsElapsed,
  calculateOutstandingPrincipal,
  calculateTotalInterest,
  calculateRemainingInterest,
  calculateLoanProgress,
  calculateRemainingMonths,
  getNextEMIDate,
  calculateAmountsPaid,
} from './financial-math/loan-math';
import type { LoanAnalytics } from '@/types/loan-analytics.types';

/**
 * Builds a full LoanAnalytics view model for a given loan.
 *
 * @param systemId           - The loan's SystemId (UUID from BC)
 * @param ownerEntraObjectId - The authenticated user's Entra Object ID (for ownership enforcement)
 * @returns LoanAnalytics view model, or null if loan is not found / access denied
 */
export async function getLoanAnalytics(
  systemId: string,
  ownerEntraObjectId: string
): Promise<LoanAnalytics | null> {
  // 1. Fetch loan from BC (ownership check is enforced inside getLoan)
  const loan = await getLoan(systemId, ownerEntraObjectId);
  if (!loan) return null;

  const {
    principalAmount,
    interestRate,
    emiAmount,
    tenureMonths,
    startDate,
    status,
  } = loan;

  const annualRate = interestRate; // interestRate stored in BC is annual %

  // 2. Generate the full amortization schedule (dynamically — not stored)
  const schedule = generateAmortizationSchedule(
    principalAmount,
    annualRate,
    emiAmount,
    startDate,
    tenureMonths
  );

  // 3. Timing analytics
  const monthsElapsed = status === 'Closed'
    ? tenureMonths
    : calculateMonthsElapsed(startDate, tenureMonths);

  const remainingMonths = calculateRemainingMonths(tenureMonths, monthsElapsed, status);
  const nextEMIDate = getNextEMIDate(startDate, monthsElapsed, tenureMonths, status);

  // 4. Financial analytics
  const totalInterest = calculateTotalInterest(emiAmount, tenureMonths, principalAmount);
  const totalPayable = Math.round((principalAmount + totalInterest) * 100) / 100;

  const { principalPaid, interestPaid } = calculateAmountsPaid(schedule, monthsElapsed);
  const outstandingPrincipal = calculateOutstandingPrincipal(schedule, monthsElapsed);
  const remainingInterest = calculateRemainingInterest(schedule, monthsElapsed);

  // 5. Progress
  const progressPercent = calculateLoanProgress(monthsElapsed, tenureMonths, status);

  return {
    loan,
    monthsElapsed,
    remainingMonths,
    nextEMIDate,
    totalInterest,
    totalPayable,
    principalPaid,
    interestPaid,
    outstandingPrincipal,
    remainingInterest,
    progressPercent,
    schedule,
  };
}
