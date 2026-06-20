import { z } from 'zod';
import { isoDateString, positiveAmount } from '../../shared/validators.js';

/**
 * Transfer request validation. Source and destination must differ — that's
 * also enforced by a CHECK constraint in the database, but rejecting it here
 * gives the user a clean message instead of a 500.
 */
export const createTransferSchema = z
  .object({
    fromWalletId: z.string().uuid('Invalid source wallet id'),
    toWalletId: z.string().uuid('Invalid destination wallet id'),
    amount: positiveAmount,
    description: z.string().trim().max(500).optional(),
    transferDate: isoDateString.optional(), // defaults to today in the service
  })
  .refine((data) => data.fromWalletId !== data.toWalletId, {
    message: 'Source and destination wallets must be different.',
    path: ['toWalletId'],
  });

export const transferIdParamSchema = z.object({
  transferId: z.string().uuid('Invalid transfer id'),
});

export type CreateTransferInput = z.infer<typeof createTransferSchema>;
