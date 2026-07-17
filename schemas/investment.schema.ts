import { z } from 'zod';
import { InvestmentType, InvestmentStatus } from '@/types/investment.types';

const investmentTypes: [InvestmentType, ...InvestmentType[]] = [
  'FixedDeposit',
  'RecurringDeposit',
  'SIP',
  'MutualFund',
  'Stock',
  'Gold',
  'Crypto',
  'Custom'
];

const investmentStatuses: [InvestmentStatus, ...InvestmentStatus[]] = [
  'Active',
  'Matured',
  'Closed',
  'Sold'
];

export const InvestmentSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  type: z.enum(investmentTypes),
  investedAmount: z.coerce.number().min(0, 'Invested Amount cannot be negative'),
  currentValue: z.coerce.number().min(0, 'Current Value cannot be negative'),
  status: z.enum(investmentStatuses),
  notes: z.string().max(2048, 'Notes must be 2048 characters or less').optional().nullable()
});

export type InvestmentFormData = z.infer<typeof InvestmentSchema>;
