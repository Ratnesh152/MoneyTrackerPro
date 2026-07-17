import { z } from 'zod';
import { RecurringFrequency } from '@/types/recurring-transaction.types';

const recurringFrequencies: [RecurringFrequency, ...RecurringFrequency[]] = [
  'Daily',
  'Weekly',
  'BiWeekly',
  'Monthly',
  'Quarterly',
  'HalfYearly',
  'Yearly'
];

export const RecurringTransactionSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  transactionType: z.enum(['Income', 'Expense']),
  accountId: z.string().min(1, 'Account is required'),
  categoryId: z.string().min(1, 'Category is required'),
  amount: z.coerce.number().positive('Amount must be greater than zero'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional().nullable(),
  frequency: z.enum(recurringFrequencies),
  interval: z.coerce.number().int().min(1, 'Interval must be at least 1'),
  nextRunDate: z.string().min(1, 'Next run date is required'),
  autoGenerate: z.boolean().default(true),
  active: z.boolean().default(true),
  notes: z.string().max(2048, 'Notes must be 2048 characters or less').optional().nullable()
}).superRefine((data, ctx) => {
  const start = new Date(data.startDate);
  start.setHours(0, 0, 0, 0);

  const next = new Date(data.nextRunDate);
  next.setHours(0, 0, 0, 0);

  if (next < start) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Next Run Date cannot be before Start Date',
      path: ['nextRunDate'],
    });
  }

  if (data.endDate) {
    const end = new Date(data.endDate);
    end.setHours(0, 0, 0, 0);

    if (end < start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End Date cannot be before Start Date',
        path: ['endDate'],
      });
    }
  }
});

export type RecurringTransactionFormData = z.infer<typeof RecurringTransactionSchema>;
