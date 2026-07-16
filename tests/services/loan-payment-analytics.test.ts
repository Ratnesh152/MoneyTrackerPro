import { describe, it, expect, beforeEach, vi } from 'vitest';
import { calculateLoanPaymentAnalytics } from '../../services/loan-payment-analytics.service';
import { LoanAnalytics } from '../../types/loan-analytics.types';
import { LoanPayment } from '../../types/loan-payment.types';
import { Loan } from '../../types/loan.types';
import { addDays, subDays, formatISO } from 'date-fns';

describe('Loan Payment Analytics Engine', () => {
  const today = new Date();
  const pastDate = subDays(today, 10);
  const futureDate = addDays(today, 10);

  const mockLoan = {
    systemId: 'loan-1',
    loanName: 'Test Home Loan',
    principalAmount: 100000,
    interestRate: 10,
    emiAmount: 5062.5,
    loanStartDate: '2024-01-01',
    loanTermMonths: 24,
    status: 'Active' as const
  } as unknown as Loan;

  const mockBaseAnalytics = {
    loan: mockLoan,
    schedule: [
      {
        month: 1,
        date: formatISO(pastDate), // Past due
        emi: 5062.5,
        principal: 4979.17,
        interest: 83.33,
        outstanding: 5020.83,
      },
      {
        month: 2,
        date: formatISO(futureDate), // Future
        emi: 5062.5,
        principal: 5020.83,
        interest: 41.67,
        outstanding: 0,
      }
    ],
    totalInterest: 125.00,
    totalPayable: 10125.00,
  } as unknown as LoanAnalytics;

  it('calculates correctly with zero payments (missed EMI)', () => {
    const result = calculateLoanPaymentAnalytics(mockBaseAnalytics, []);
    
    expect(result.outstandingPrincipal).toBe(10000);
    expect(result.loanHealth).toBe('Warning'); // 1 past due
    expect(result.overdueAmount).toBe(5062.5); // EMI 1 is overdue
    expect(result.daysPastDue).toBe(10);
  });

  it('processes a full payment correctly', () => {
    const payments = [{
      systemId: 'p-1',
      etag: 'W/1',
      ownerEntraObjectId: 'user-1',
      loanSystemId: 'loan-1',
      emiNumber: 1,
      paymentDate: formatISO(pastDate),
      amountPaid: 5062.5,
      paymentMethod: 'Bank Transfer',
      status: 'Paid'
    }] as LoanPayment[];

    const result = calculateLoanPaymentAnalytics(mockBaseAnalytics, payments);
    
    expect(result.outstandingPrincipal).toBe(5020.83); // 10000 - 4979.17
    expect(result.loanHealth).toBe('Healthy');
    expect(result.overdueAmount).toBe(0);
    expect(result.currentEMI).toBe(2);
    expect(result.principalPaid).toBe(4979.17);
    expect(result.interestPaid).toBe(83.33);
  });

  it('processes a partial payment (interest first)', () => {
    // EMI 1 interest is 83.33. User pays 1000.
    const payments = [{
      systemId: 'p-1',
      etag: 'W/1',
      ownerEntraObjectId: 'user-1',
      loanSystemId: 'loan-1',
      emiNumber: 1,
      paymentDate: formatISO(pastDate),
      amountPaid: 1000,
      paymentMethod: 'Bank Transfer',
      status: 'Partially Paid'
    }] as LoanPayment[];

    const result = calculateLoanPaymentAnalytics(mockBaseAnalytics, payments);
    
    expect(result.interestPaid).toBe(83.33);
    expect(result.principalPaid).toBe(1000 - 83.33); // 916.67
    expect(result.outstandingPrincipal).toBe(10000 - 916.67); // 9083.33
    expect(result.loanHealth).toBe('Warning'); // Partially paid but past due
    expect(result.overdueAmount).toBe(5062.5 - 1000); // 4062.5
    expect(result.currentEMI).toBe(1);
  });

  it('ignores cancelled (reversed) payments', () => {
    const payments = [{
      systemId: 'p-1',
      etag: 'W/1',
      ownerEntraObjectId: 'user-1',
      loanSystemId: 'loan-1',
      emiNumber: 1,
      paymentDate: formatISO(pastDate),
      amountPaid: 5062.5,
      paymentMethod: 'Bank Transfer',
      status: 'Cancelled' // Reversed
    }] as LoanPayment[];

    const result = calculateLoanPaymentAnalytics(mockBaseAnalytics, payments);
    
    expect(result.outstandingPrincipal).toBe(10000);
    expect(result.principalPaid).toBe(0);
    expect(result.history.length).toBe(0); // Cancelled payments aren't mapped
  });

  it('calculates closure perfectly when all EMIs paid', () => {
    const payments = [
      {
        systemId: 'p-1',
        etag: 'W/1',
        ownerEntraObjectId: 'user-1',
        loanSystemId: 'loan-1',
        emiNumber: 1,
        paymentDate: formatISO(pastDate),
        amountPaid: 5062.5,
        paymentMethod: 'Bank Transfer',
        status: 'Paid'
      },
      {
        systemId: 'p-2',
        etag: 'W/1',
        ownerEntraObjectId: 'user-1',
        loanSystemId: 'loan-1',
        emiNumber: 2,
        paymentDate: formatISO(futureDate),
        amountPaid: 5062.5,
        paymentMethod: 'Bank Transfer',
        status: 'Paid'
      }
    ] as LoanPayment[];

    const result = calculateLoanPaymentAnalytics(mockBaseAnalytics, payments);
    
    expect(result.outstandingPrincipal).toBe(0);
    expect(result.paymentRatio).toBe(100);
    expect(result.loanHealth).toBe('Healthy');
  });
});
