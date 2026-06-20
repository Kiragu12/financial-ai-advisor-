import { z } from 'zod';

/**
 * Reusable Zod building blocks for the financial domain. Centralised so the
 * rules for money and dates are defined once and stay identical across every
 * module (transactions, transfers, goals, …).
 */

// Largest value that fits numeric(14,2): 12 digits before the decimal point.
export const MAX_AMOUNT = 999_999_999_999.99;

/** A positive monetary amount within the column's range. */
export const positiveAmount = z
  .number()
  .positive('Amount must be greater than zero')
  .max(MAX_AMOUNT);

/** A 'YYYY-MM-DD' string that is also a real calendar date. */
export const isoDateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
  .refine((value) => !Number.isNaN(Date.parse(value)), 'Not a valid date');
