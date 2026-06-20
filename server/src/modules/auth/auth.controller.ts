import type { CookieOptions, Request, Response } from 'express';
import { env } from '../../config/env.js';
import * as authService from './auth.services.js';

/**
 * HTTP layer for auth. Translates requests into service calls and shapes the
 * response. The JWT is delivered as an HTTP-only cookie (not in the body) so
 * browser JavaScript — and any XSS — cannot read it.
 */

// Keep this in sync with JWT_EXPIRES_IN (7d). Controls how long the browser
// keeps the cookie; the token itself also carries its own expiry.
const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function authCookieOptions(): CookieOptions {
  return {
    httpOnly: true, // not readable by document.cookie
    secure: env.NODE_ENV === 'production', // HTTPS-only in production
    sameSite: 'lax', // sent on top-level navigations, blocks most CSRF
    path: '/',
    maxAge: COOKIE_MAX_AGE_MS,
  };
}

export async function register(req: Request, res: Response): Promise<void> {
  const { user, token } = await authService.register(req.body);
  res.cookie(env.COOKIE_NAME, token, authCookieOptions());
  res.status(201).json({ user });
}

export async function login(req: Request, res: Response): Promise<void> {
  const { user, token } = await authService.login(req.body);
  res.cookie(env.COOKIE_NAME, token, authCookieOptions());
  res.json({ user });
}

export async function logout(_req: Request, res: Response): Promise<void> {
  // clearCookie must match the same attributes the cookie was set with.
  const clearOptions = authCookieOptions();
  delete clearOptions.maxAge;
  res.clearCookie(env.COOKIE_NAME, clearOptions);
  res.status(204).send();
}

export async function me(req: Request, res: Response): Promise<void> {
  // requireAuth guarantees req.user is present before this runs.
  const user = await authService.getProfile(req.user!.id);
  res.json({ user });
}
