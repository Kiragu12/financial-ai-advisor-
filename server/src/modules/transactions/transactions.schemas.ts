import { z } from 'zod';
import { isoDateString, positiveAmount } from '../../shared/validators.js';

/**
 * Transaction request validation.
 *
 * Users may only create `income` or `expense` directly — the transfer_* types
 * are produced internally by the transfers feature. Amount is positive; the
 * sign (money in vs out) is derived from the type, never sent by the client.
 */

export const createTransactionSchema = z.object({
  walletId: z.string().uuid('Invalid wallet id'),
  type: z.enum(['income', 'expense']),
  amount: positiveAmount,
  categoryId: z.string().uuid('Invalid category id').optional(),
  description: z.string().trim().max(500).optional(),
  transactionDate: isoDateString.optional(), // defaults to today in the service
});

/**
 * Editing a transaction. Every field is optional (PATCH semantics) but at least
 * one must be present. `categoryId` and `description` accept null to clear them.
 * Only income/expense are editable — transfer legs are rejected in the service.
 */
export const updateTransactionSchema = z
  .object({
    walletId: z.string().uuid('Invalid wallet id').optional(),
    type: z.enum(['income', 'expense']).optional(),
    amount: positiveAmount.optional(),
    categoryId: z.string().uuid('Invalid category id').nullable().optional(),
    description: z.string().trim().max(500).nullable().optional(),
    transactionDate: isoDateString.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Provide at least one field to update.',
  });

export const transactionIdParamSchema = z.object({
  transactionId: z.string().uuid('Invalid transaction id'),
});

/**
 * Filters for GET /api/transactions. Parsed from the query string in the
 * controller (Express 5 makes req.query read-only, so we don't mutate it).
 * z.coerce turns the always-string query values into numbers where needed.
 */
export const listTransactionsQuerySchema = z.object({
  walletId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  type: z.enum(['income', 'expense', 'transfer_in', 'transfer_out']).optional(),
  from: isoDateString.optional(),
  to: isoDateString.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type ListTransactionsQuery = z.infer<typeof listTransactionsQuerySchema>;
