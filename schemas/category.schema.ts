import { z } from 'zod';

export const categorySchema = z.object({
  code: z
    .string()
    .min(1, 'Category code is required')
    .max(20, 'Category code must be 20 characters or less')
    .regex(/^[A-Z0-9_]+$/, 'Code can only contain uppercase letters, numbers, and underscores'),
  name: z
    .string()
    .min(1, 'Category name is required')
    .max(100, 'Category name must be 100 characters or less'),
  transactionType: z.enum(['Income', 'Expense']),
  isActive: z.boolean(),
  displayOrder: z.coerce.number(),
  colorCode: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6})$/, 'Color must be a valid 6-character hex code (e.g., #FF5733)'),
  iconName: z
    .string()
    .min(1, 'Icon name is required')
    .max(50, 'Icon name must be 50 characters or less'),
});

export type CategoryFormData = z.infer<typeof categorySchema>;
