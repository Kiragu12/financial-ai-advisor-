import { z } from 'zod';

const MAX_AMOUNT = 999_999_999_999.99;

export const budgetMonthSchema = z
  .string()
  .regex(/^\d{4}-\d{2}$/, 'Month must be YYYY-MM')
  .optional();

export const createBudgetSchema = z.object({
  categoryId: z.string().uuid('Invalid category id'),
  amount: z.number().positive('Budget amount must be greater than zero').max(MAX_AMOUNT),
});

export const updateBudgetSchema = z.object({
  amount: z.number().positive('Budget amount must be greater than zero').max(MAX_AMOUNT),
});

export const budgetIdParamSchema = z.object({
  budgetId: z.string().uuid('Invalid budget id'),
});

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;
