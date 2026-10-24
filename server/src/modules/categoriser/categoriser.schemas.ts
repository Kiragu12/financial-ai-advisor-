import { z } from 'zod';
import { MAX_AMOUNT } from '../../shared/validators.js';

/**
 * Suggestion request. Description may be empty (the model then has only the
 * amount to go on and answers with low confidence); amount may be 0 while the
 * user is still typing.
 */
export const suggestSchema = z.object({
  description: z.string().trim().max(500),
  amount: z.number().min(0).max(MAX_AMOUNT),
});

export type SuggestInput = z.infer<typeof suggestSchema>;
