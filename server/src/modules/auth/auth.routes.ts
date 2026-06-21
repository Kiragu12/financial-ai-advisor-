import { Router } from 'express';
import { asyncHandler } from '../../shared/async-handler.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/require-auth.js';
import { authLimiter } from '../../middleware/rate-limit.js';
import { registerSchema, loginSchema } from './auth.schemas.js';
import * as authController from './auth.controller.js';

/**
 * Auth routes — mounted at /api/auth.
 *
 *   POST /register  public   create account + start session
 *   POST /login     public   start session
 *   POST /logout    public   clear session cookie
 *   GET  /me        private  current user (requires a valid session)
 */
export const authRouter = Router();

authRouter.post(
  '/register',
  authLimiter,
  validate({ body: registerSchema }),
  asyncHandler(authController.register),
);

authRouter.post(
  '/login',
  authLimiter,
  validate({ body: loginSchema }),
  asyncHandler(authController.login),
);

authRouter.post('/logout', asyncHandler(authController.logout));

authRouter.get('/me', requireAuth, asyncHandler(authController.me));
