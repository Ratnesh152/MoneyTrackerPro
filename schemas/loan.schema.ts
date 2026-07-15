import { z } from 'zod';
import { MTLoanType, MTLoanStatus } from '../types/loan.types';

export const loanSchema = z.object({
  loanName: z.string().min(2, 'Loan Name must be at least 2 characters.'),
  lenderName: z.string().min(2, 'Lender Name must be at least 2 characters.'),
  loanType: z.enum(['Home', 'Personal', 'Vehicle', 'Education', 'Business', 'Gold', 'Mortgage', 'Other'] as const),
  principalAmount: z.number().positive('Principal Amount must be greater than 0.'),
  interestRate: z.number().min(0, 'Interest rate cannot be negative.'),
  tenureMonths: z.number().int().min(1, 'Tenure must be at least 1 month.'),
  emiAmount: z.number().positive('EMI Amount must be greater than 0.'),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid start date format",
  }),
  loanAccountNumber: z.string().min(1, 'Loan Account Number is required.'),
  currencyCode: z.string().min(2, 'Currency code is required').default('INR'),
  supportsPrepayment: z.boolean().default(false),
  status: z.enum(['Active', 'Closed'] as const).default('Active'),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters.').optional().or(z.literal('')),
});

export type LoanFormData = z.infer<typeof loanSchema>;
