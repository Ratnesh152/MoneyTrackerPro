import { z } from 'zod';

export const transactionTypeSchema = z.enum(['Income', 'Expense']);

// 1. Browser Transaction Input (must never accept ownerEntraObjectId)
export const browserTransactionInputSchema = z.object({
  transactionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  transactionType: transactionTypeSchema,
  description: z.string().min(1).max(100),
  categoryId: z.string().min(1, 'Category must be selected'),
  subcategoryCode: z.string().max(20).optional().nullable(),
  accountId: z.string().min(1, 'Account must be selected'),
  amount: z.coerce.number().positive('Amount must be greater than zero'),
  currencyCode: z.string().max(10).optional().nullable(),
  paymentMethodCode: z.string().max(20).optional().nullable(),
  reference: z.string().max(100).optional().nullable(),
  notes: z.string().max(2048).optional().nullable(),
  tags: z.string().max(250).optional().nullable(),
});

// 2. Business Central Create DTO Schema
export const createTransactionSchema = browserTransactionInputSchema.extend({
  ownerEntraObjectId: z.string().uuid(),
  accountCode: z.string().max(20),
  categoryCode: z.string().max(20),
}).transform(data => ({
  ...data,
  subcategoryCode: data.subcategoryCode ?? '',
  currencyCode: data.currencyCode ?? '',
  paymentMethodCode: data.paymentMethodCode ?? '',
  reference: data.reference ?? '',
  notes: data.notes ?? '',
  tags: data.tags ?? '',
}));

// 3. Business Central Update DTO Schema
export const updateTransactionSchema = browserTransactionInputSchema.partial().transform(data => {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) {
      result[key] = '';
    } else {
      result[key] = value;
    }
  }
  return result;
});

// 4. Filter / Search Parameters Schema
export const transactionFilterSchema = z.object({
  top: z.number().positive().max(1000).optional(),
  skip: z.number().nonnegative().optional(),
  filter: z.string().optional(),
  orderBy: z.string().optional(),
});
