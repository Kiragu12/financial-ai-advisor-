import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../shared/app-error.js';

/**
 * Central error handler — the single exit point for every error in the API.
 *
 * Guarantees one consistent response shape:
 *   { error: { code, message, details? } }
 *
 * Three cases, in order:
 *   1. ZodError    → 400, with field-level details (validation failures)
 *   2. AppError    → its own status/code (expected, operational errors)
 *   3. anything    → 500, logged, message hidden (unexpected bugs)
 */
export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'One or more fields are invalid.',
        details: error.flatten().fieldErrors,
      },
    });
    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        ...(error.details !== undefined ? { details: error.details } : {}),
      },
    });
    return;
  }

  // Unexpected: log the real error server-side, return a generic message.
  console.error('[error]', error);
  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Something went wrong.',
    },
  });
};
