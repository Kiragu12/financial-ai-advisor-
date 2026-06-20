import { z } from 'zod';

/**
 * Auth request validation.
 *
 * These schemas are the contract for what the client may send. They normalise
 * input (trim, lowercase email) so the rest of the system works with clean
 * data, and the inferred types feed straight into the service layer.
 */

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, 'Name is too short').max(120),
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long'),
  preferredCurrency: z
    .string()
    .trim()
    .length(3, 'Currency must be a 3-letter code')
    .toUpperCase()
    .optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
