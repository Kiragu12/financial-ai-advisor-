import rateLimit, { type Options } from 'express-rate-limit';

/**
 * Rate limiters — defence against brute-force and cost-abuse.
 *
 * Three tiers, applied where each matters:
 *   - globalLimiter   broad ceiling on the whole API (app.ts)
 *   - authLimiter     tight ceiling on login/register (stops password guessing
 *                     and signup spam) — applied in auth.routes.ts
 *   - advisorLimiter  caps advisor messages per window (each one runs the
 *                     insight engine over several aggregate queries) —
 *                     applied in advisor.routes.ts
 *
 * All limiters emit the same error envelope the rest of the API uses, so the
 * client handles a 429 like any other error.
 */

const sharedOptions: Partial<Options> = {
  standardHeaders: true, // RateLimit-* headers
  legacyHeaders: false, // no X-RateLimit-* headers
  handler: (_req, res, _next, options) => {
    res.status(options.statusCode).json({
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many requests. Please slow down and try again shortly.',
      },
    });
  },
};

export const globalLimiter = rateLimit({
  ...sharedOptions,
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 300, // per IP per window
});

export const authLimiter = rateLimit({
  ...sharedOptions,
  windowMs: 15 * 60 * 1000,
  limit: 10, // login/register attempts per IP per window
  // Count only failed attempts — a user who logs in successfully isn't penalised.
  skipSuccessfulRequests: true,
});

export const advisorLimiter = rateLimit({
  ...sharedOptions,
  windowMs: 60 * 1000, // 1 minute
  limit: 10, // AI messages per IP per minute — protects the API bill
});
