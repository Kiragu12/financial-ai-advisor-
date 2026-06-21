import { z } from 'zod';
import { isoDateString } from '../../shared/validators.js';

/**
 * Dashboard query validation.
 *
 * These cover query-string params. Express 5 makes req.query read-only, so the
 * controller parses req.query through these directly (rather than via the
 * `validate` middleware, which mutates req.body/req.params).
 */

export const spendingQuerySchema = z.object({
  from: isoDateString.optional(), // defaults to start of current month in the service
  to: isoDateString.optional(), // defaults to today in the service
});

export const cashflowQuerySchema = z.object({
  months: z.coerce.number().int().min(1).max(24).default(6),
});

export type SpendingQuery = z.infer<typeof spendingQuerySchema>;
export type CashflowQuery = z.infer<typeof cashflowQuerySchema>;
