import { z } from 'zod';
import { SavingsGoalType, SavingsGoalStatus } from '@/types/goal.types';

const goalTypes: [SavingsGoalType, ...SavingsGoalType[]] = [
  'EmergencyFund',
  'Vacation',
  'Car',
  'House',
  'Education',
  'Retirement',
  'Wedding',
  'Custom'
];

const goalStatuses: [SavingsGoalStatus, ...SavingsGoalStatus[]] = [
  'Active',
  'Completed',
  'Paused',
  'Cancelled'
];

export const SavingsGoalSchema = z.object({
  goalName: z.string().min(1, 'Goal Name is required').max(100, 'Goal Name must be 100 characters or less'),
  goalType: z.enum(goalTypes),
  targetAmount: z.coerce.number().positive('Target Amount must be greater than zero'),
  openingSavedAmount: z.coerce.number().min(0, 'Opening Saved Amount cannot be negative'),
  targetDate: z.string().optional().nullable(),
  monthlyContribution: z.coerce.number().min(0, 'Monthly Contribution cannot be negative'),
  autoContribute: z.boolean().default(false),
  status: z.enum(goalStatuses),
  notes: z.string().max(250, 'Notes must be 250 characters or less').optional().nullable()
}).superRefine((data, ctx) => {
  if (data.openingSavedAmount > data.targetAmount) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Opening Saved Amount cannot exceed Target Amount',
      path: ['openingSavedAmount'],
    });
  }

  if (data.targetDate) {
    const target = new Date(data.targetDate);
    target.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (target < today) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Target Date cannot be in the past',
        path: ['targetDate'],
      });
    }
  }
});

export type SavingsGoalFormData = z.infer<typeof SavingsGoalSchema>;
