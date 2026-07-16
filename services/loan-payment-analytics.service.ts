import { LoanPayment, LoanPaymentHistoryEntry } from '@/types/loan-payment.types';
import { LoanAnalytics } from '@/types/loan-analytics.types';
import { differenceInDays, isBefore, isAfter, parseISO } from 'date-fns';

export interface LoanPaymentAnalytics {
  outstandingPrincipal: number;
  principalPaid: number;
  interestPaid: number;
  remainingInterest: number;
  loanHealth: 'Healthy' | 'Warning' | 'Critical';
  daysPastDue: number;
  currentEMI: number;
  lastPaymentDate: string | null;
  lastPaidEMI: number;
  overdueAmount: number;
  paymentRatio: number; // percentage of principal + interest paid
  history: LoanPaymentHistoryEntry[];
}

/**
 * Derives dynamic loan analytics by merging the static loan amortization schedule
 * with the actual recorded payment history.
 */
export function calculateLoanPaymentAnalytics(
  baseAnalytics: LoanAnalytics,
  payments: LoanPayment[]
): LoanPaymentAnalytics {
  const { schedule, loan } = baseAnalytics;
  
  let principalPaid = 0;
  let interestPaid = 0;
  let overdueAmount = 0;
  let daysPastDue = 0;
  let overdueCount = 0;
  let lastPaymentDate: string | null = null;
  let lastPaidEMI = 0;
  
  // Create a map of payments by EMI Number for quick lookup (assuming only 1 active payment per EMI)
  const paymentMap = new Map<number, LoanPayment>();
  for (const payment of payments) {
    if (payment.status !== 'Cancelled') {
      paymentMap.set(payment.emiNumber, payment);
    }
  }

  const history: LoanPaymentHistoryEntry[] = [];
  const today = new Date();

  let currentEMI = 1;

  for (let i = 0; i < schedule.length; i++) {
    const emi = schedule[i];
    const payment = paymentMap.get(emi.month);
    
    let emiPrincipalPaid = 0;
    let emiInterestPaid = 0;
    let daysLate = 0;
    const dueDateObj = parseISO(emi.date);

    if (payment && payment.status === 'Paid') {
      // For a fully paid EMI, we assume the full scheduled principal and interest for that month were covered.
      // (Even if AmountPaid was slightly different, the derived analytics ties it to the schedule)
      emiPrincipalPaid = emi.principal;
      emiInterestPaid = emi.interest;
      
      principalPaid += emiPrincipalPaid;
      interestPaid += emiInterestPaid;
      
      const paymentDateObj = parseISO(payment.paymentDate);
      if (isAfter(paymentDateObj, dueDateObj)) {
        daysLate = differenceInDays(paymentDateObj, dueDateObj);
      }
      
      if (!lastPaymentDate || isAfter(paymentDateObj, parseISO(lastPaymentDate))) {
        lastPaymentDate = payment.paymentDate;
      }
      
      lastPaidEMI = Math.max(lastPaidEMI, emi.month);
      currentEMI = emi.month + 1; // The next EMI to be paid
    } else if (payment && payment.status === 'Partially Paid') {
      // For partial payments, simple derivation: apply towards interest first, then principal.
      // (This is a simplified assumption; real systems might have complex rules)
      const amount = payment.amountPaid;
      if (amount >= emi.interest) {
        emiInterestPaid = emi.interest;
        emiPrincipalPaid = Math.min(amount - emiInterestPaid, emi.principal);
      } else {
        emiInterestPaid = amount;
      }
      principalPaid += emiPrincipalPaid;
      interestPaid += emiInterestPaid;
      
      // Consider it overdue if past due date
      if (isAfter(today, dueDateObj)) {
        overdueCount++;
        overdueAmount += (emi.emi - amount);
        const late = differenceInDays(today, dueDateObj);
        daysPastDue = Math.max(daysPastDue, late);
      }
      currentEMI = emi.month;
    } else {
      // Pending, Skipped, or no payment record yet
      if (payment && payment.status === 'Skipped') {
        overdueCount++;
        overdueAmount += emi.emi;
        currentEMI = emi.month;
      } else if (isAfter(today, dueDateObj)) {
        // Due date has passed without payment
        overdueCount++;
        overdueAmount += emi.emi;
        const late = differenceInDays(today, dueDateObj);
        daysPastDue = Math.max(daysPastDue, late);
        currentEMI = emi.month; // First unpaid EMI
      } else {
         if (currentEMI === 1 || (currentEMI === lastPaidEMI + 1 && i === currentEMI - 1)) {
            // Keep current EMI as the first one not overdue or paid
         }
      }
    }

    if (payment) {
      history.push({
        ...payment,
        dueDate: emi.date,
        daysLate,
        remainingBalanceAfterPayment: loan.principalAmount - principalPaid,
      });
    }
  }

  // Ensure currentEMI doesn't exceed tenure
  currentEMI = Math.min(currentEMI, loan.tenureMonths);

  const outstandingPrincipal = Math.max(0, loan.principalAmount - principalPaid);
  const remainingInterest = Math.max(0, baseAnalytics.totalInterest - interestPaid);
  
  const paymentRatio = baseAnalytics.totalPayable > 0 
    ? ((principalPaid + interestPaid) / baseAnalytics.totalPayable) * 100 
    : 0;

  let loanHealth: 'Healthy' | 'Warning' | 'Critical' = 'Healthy';
  if (overdueCount >= 2) {
    loanHealth = 'Critical';
  } else if (overdueCount === 1) {
    loanHealth = 'Warning';
  }

  // Sort history descending by EMI number
  history.sort((a, b) => b.emiNumber - a.emiNumber);

  return {
    outstandingPrincipal,
    principalPaid,
    interestPaid,
    remainingInterest,
    loanHealth,
    daysPastDue,
    currentEMI,
    lastPaymentDate,
    lastPaidEMI,
    overdueAmount,
    paymentRatio,
    history
  };
}
