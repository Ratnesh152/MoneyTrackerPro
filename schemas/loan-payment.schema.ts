import { z } from 'zod';

const PAYMENT_METHODS = ['Bank Transfer', 'UPI', 'Cash', 'Cheque', 'Auto Debit', 'Card', 'Other'] as const;
const PAYMENT_STATUSES = ['Pending', 'Paid', 'Partially Paid', 'Skipped', 'Cancelled'] as const;

export const loanPaymentSchema = z.object({
  paymentDate: z.string().min(1, 'Payment Date is required'),
  emiNumber: z.number().int().positive('EMI Number must be a positive integer'),
  amountPaid: z.number().min(0, 'Amount Paid must be zero or greater'),
  paymentMethod: z.enum(PAYMENT_METHODS, {
    message: 'Invalid payment method',
  }),
  transactionReference: z.string().max(50, 'Transaction reference is too long').optional(),
  notes: z.string().max(250, 'Notes are too long').optional(),
  status: z.enum(PAYMENT_STATUSES, {
    message: 'Invalid status',
  }),
});

export type LoanPaymentFormData = z.infer<typeof loanPaymentSchema>;
