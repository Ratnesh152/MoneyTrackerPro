/**
 * EMI (Equated Monthly Installment) Calculations
 * Pure TypeScript — no Next.js or Business Central dependencies.
 *
 * Standard bank formula:
 *   EMI = P × r × (1 + r)^n / ((1 + r)^n − 1)
 *   where r = monthly interest rate, n = tenure in months
 */

/**
 * Converts an annual interest rate (%) to a monthly decimal rate.
 * e.g. 8.75 → 0.007291666...
 */
export function calculateMonthlyInterestRate(annualRate: number): number {
  return annualRate / 12 / 100;
}

/**
 * Calculates the theoretical EMI using the standard compound-interest formula.
 * Use this for validation / display.
 * The stored emiAmount on the Loan record is the source of truth for schedule generation.
 *
 * @param principal    - Loan principal amount (P)
 * @param annualRate   - Annual interest rate in percent (e.g. 8.75)
 * @param tenureMonths - Loan tenure in months (n)
 * @returns Calculated EMI amount rounded to 2 decimal places
 */
export function calculateEMI(
  principal: number,
  annualRate: number,
  tenureMonths: number
): number {
  if (principal <= 0 || tenureMonths <= 0) return 0;

  // Zero-interest case (e.g. promotional loans)
  if (annualRate === 0) {
    return Math.round((principal / tenureMonths) * 100) / 100;
  }

  const r = calculateMonthlyInterestRate(annualRate);
  const onePlusR_n = Math.pow(1 + r, tenureMonths);
  const emi = (principal * r * onePlusR_n) / (onePlusR_n - 1);

  return Math.round(emi * 100) / 100;
}
