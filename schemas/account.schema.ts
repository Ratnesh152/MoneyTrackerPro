import { z } from 'zod';

export const accountSchema = z.object({
  name: z.string().min(1, 'Account name is required'),
  accountType: z.enum(['Cash', 'Bank', 'Wallet']),
  openingBalance: z.coerce.number(),
  currencyCode: z.string().max(10).optional().nullable(),
  isDefault: z.boolean(),
  notes: z.string().max(2048).optional().nullable(),
});

export type AccountFormData = z.infer<typeof accountSchema>;
