import { z } from 'zod';

/**
 * Wallet request validation.
 *
 * - Create allows an opening balance, which seeds the starting current balance.
 * - Update is metadata-only (name / type). Currency and balances are NOT
 *   editable here: changing a wallet's currency after it has transactions, or
 *   editing a balance by hand, would corrupt financial history. Balances move
 *   only through transactions and transfers (Sprints 4–5).
 */

export const walletTypeEnum = z.enum([
  'cash',
  'mobile_money',
  'bank',
  'savings',
  'custom',
]);

// Max value that fits numeric(14,2): 12 digits before the decimal point.
const MAX_AMOUNT = 999_999_999_999.99;

export const createWalletSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(80),
  type: walletTypeEnum,
  currency: z.string().trim().length(3).toUpperCase().default('KES'),
  openingBalance: z
    .number()
    .nonnegative('Opening balance cannot be negative')
    .max(MAX_AMOUNT)
    .default(0),
});

export const updateWalletSchema = z
  .object({
    name: z.string().trim().min(1).max(80).optional(),
    type: walletTypeEnum.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Provide at least one field to update.',
  });

export const walletIdParamSchema = z.object({
  walletId: z.string().uuid('Invalid wallet id'),
});

export type CreateWalletInput = z.infer<typeof createWalletSchema>;
export type UpdateWalletInput = z.infer<typeof updateWalletSchema>;
