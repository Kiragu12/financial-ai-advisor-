import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

/**
 * JWT signing & verification — the only place that touches the token library.
 *
 * The token carries the minimum needed to identify the caller on later
 * requests. Never put secrets or sensitive profile data in here: the payload
 * is base64-encoded, not encrypted, and is readable by anyone holding it.
 */

export interface JwtPayload {
  sub: string; // user id
  email: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

/**
 * Verifies a token's signature and expiry, then returns a typed payload.
 * Throws if the token is missing, tampered with, or expired — callers
 * (the auth middleware) translate that into a 401.
 */
export function verifyToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET);

  if (
    typeof decoded !== 'object' ||
    decoded === null ||
    typeof decoded.sub !== 'string' ||
    typeof (decoded as Record<string, unknown>).email !== 'string'
  ) {
    throw new Error('Malformed token payload');
  }

  return { sub: decoded.sub, email: (decoded as { email: string }).email };
}
