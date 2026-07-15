/**
 * Interest & Principal Component Calculations
 * Pure TypeScript — no Next.js or Business Central dependencies.
 *
 * For any given EMI payment in a reducing-balance loan:
 *   Interest Component  = Outstanding Principal × Monthly Rate
 *   Principal Component = EMI − Interest Component
 */

/**
 * Calculates the interest component of a single EMI payment.
 *
 * @param outstandingPrincipal - Remaining principal before this payment
 * @param monthlyRate          - Monthly interest rate as a decimal (e.g. 0.007291 for 8.75% p.a.)
 * @returns Interest portion of the EMI (unrounded)
 */
export function calculateInterestComponent(
  outstandingPrincipal: number,
  monthlyRate: number
): number {
  return outstandingPrincipal * monthlyRate;
}

/**
 * Calculates the principal component of a single EMI payment.
 *
 * @param emi               - Total EMI amount for this period
 * @param interestComponent - Interest portion already calculated
 * @returns Principal reduction portion of the EMI (unrounded)
 */
export function calculatePrincipalComponent(
  emi: number,
  interestComponent: number
): number {
  return emi - interestComponent;
}
