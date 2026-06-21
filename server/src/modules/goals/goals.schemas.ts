import { z } from 'zod';
import { isoDateString, positiveAmount } from '../../shared/validators.js';

/**
 * Savings goal request validation.
 *
 * - Create needs a name and a target; deadline is optional.
 * - Update is partial (any subset) but must change at least one field. Status can
 *   be moved between active/paused/cancelled/completed by hand; the service also
 *   auto-completes a goal when a contribution reaches its target.
 * - Contribute records money towards the goal, optionally drawn from a wallet.
 */

export const goalStatusEnum = z.enum(['active', 'completed', 'paused', 'cancelled']);

export const createGoalSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  targetAmount: positiveAmount,
  deadline: isoDateString.optional(),
});

export const updateGoalSchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    targetAmount: positiveAmount.optional(),
    deadline: isoDateString.nullable().optional(), // null clears the deadline
    status: goalStatusEnum.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Provide at least one field to update.',
  });

export const createContributionSchema = z.object({
  amount: positiveAmount,
  walletId: z.string().uuid('Invalid wallet id').optional(),
  contributionDate: isoDateString.optional(), // defaults to today in the service
  note: z.string().trim().max(500).optional(),
});

export const goalIdParamSchema = z.object({
  goalId: z.string().uuid('Invalid goal id'),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
export type CreateContributionInput = z.infer<typeof createContributionSchema>;
