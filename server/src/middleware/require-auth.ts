import type { RequestHandler } from 'express';
import { env } from '../config/env.js';
import { AppError } from '../shared/app-error.js';
import { verifyToken } from '../shared/jwt.js';

/**
 * Gatekeeper for protected routes.
 *
 * Reads the JWT from the HTTP-only cookie, verifies it, and attaches the
 * caller's identity to `req.user`. Any failure → 401. Place this before
 * controllers that must only run for an authenticated user.
 */
export const requireAuth: RequestHandler = (req, _res, next) => {
  const token = req.cookies?.[env.COOKIE_NAME] as string | undefined;

  if (!token) {
    next(AppError.unauthorized());
    return;
  }

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch {
    next(AppError.unauthorized('Your session is invalid or has expired.'));
  }
};
