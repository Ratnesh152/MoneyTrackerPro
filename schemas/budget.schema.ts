import { z } from 'zod';

export const budgetSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  budgetMonth: z.coerce.number().min(1, 'Month must be between 1 and 12').max(12, 'Month must be between 1 and 12'),
  budgetYear: z.coerce.number().min(2000, 'Year must be valid'),
  budgetAmount: z.coerce.number().min(0, 'Budget amount must be 0 or greater'),
  notes: z.string().max(2048, 'Notes cannot exceed 2048 characters').optional().nullable(),
});

export type BudgetSchema = z.infer<typeof budgetSchema>;
