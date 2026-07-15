import { z } from 'zod';
import { MTCreditCardNetwork } from '../types/credit-card.types';

export const creditCardSchema = z.object({
  cardName: z.string().min(2, 'Card Name must be at least 2 characters.'),
  issuingBank: z.string().min(2, 'Issuing Bank must be at least 2 characters.'),
  cardNetwork: z.enum(['Visa', 'MasterCard', 'RuPay', 'Amex', 'Discover', 'Other'] as const),
  last4Digits: z.string().regex(/^\d{4}$/, 'Must be exactly 4 digits.'),
  creditLimit: z.number().positive('Credit Limit must be greater than 0.'),
  currencyCode: z.string().min(2, 'Currency code is required').default('INR'),
  statementDay: z.number().int().min(1).max(31, 'Must be between 1 and 31'),
  dueDay: z.number().int().min(1).max(31, 'Must be between 1 and 31'),
  interestRate: z.number().min(0).default(0),
  annualFee: z.number().min(0).default(0),
  supportsEMI: z.boolean().default(false),
  isActive: z.boolean().default(true),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters.').optional(),
}).refine((data) => data.statementDay !== data.dueDay, {
  message: "Statement Day cannot be the same as Due Day",
  path: ["dueDay"],
});

export type CreditCardFormData = z.infer<typeof creditCardSchema>;
