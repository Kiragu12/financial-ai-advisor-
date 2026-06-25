import { z } from 'zod';

export const categoryTypeEnum = z.enum(['income', 'expense']);

const optionalText = z
  .string()
  .trim()
  .max(40)
  .optional()
  .transform((value) => (value === '' ? undefined : value));

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(80),
  type: categoryTypeEnum,
  color: optionalText,
  icon: optionalText,
});

export const updateCategorySchema = z
  .object({
    name: z.string().trim().min(1).max(80).optional(),
    color: optionalText,
    icon: optionalText,
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Provide at least one field to update.',
  });

export const categoryIdParamSchema = z.object({
  categoryId: z.string().uuid('Invalid category id'),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
