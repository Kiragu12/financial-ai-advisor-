/**
 * Type augmentation: attach the authenticated user to Express's Request.
 *
 * `requireAuth` sets `req.user` after verifying the JWT, so downstream
 * controllers can read `req.user.id` with full type safety.
 */
import 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

export {};
