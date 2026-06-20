import { Router } from 'express';
import { asyncHandler } from '../../shared/async-handler.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/require-auth.js';
import {
  createWalletSchema,
  updateWalletSchema,
  walletIdParamSchema,
} from './wallets.schemas.js';
import * as walletController from './wallets.controller.js';

/**
 * Wallet routes — mounted at /api/wallets. Every route is private.
 *
 *   GET    /            list wallets (?includeInactive=true to include archived)
 *   POST   /            create a wallet
 *   GET    /:walletId   fetch one wallet
 *   PATCH  /:walletId   update name / type
 *   DELETE /:walletId   deactivate (soft delete)
 */
export const walletsRouter = Router();

// One guard for the whole router — nothing here is public.
walletsRouter.use(requireAuth);

walletsRouter.get('/', asyncHandler(walletController.list));

walletsRouter.post(
  '/',
  validate({ body: createWalletSchema }),
  asyncHandler(walletController.create),
);

walletsRouter.get(
  '/:walletId',
  validate({ params: walletIdParamSchema }),
  asyncHandler(walletController.get),
);

walletsRouter.patch(
  '/:walletId',
  validate({ params: walletIdParamSchema, body: updateWalletSchema }),
  asyncHandler(walletController.update),
);

walletsRouter.delete(
  '/:walletId',
  validate({ params: walletIdParamSchema }),
  asyncHandler(walletController.remove),
);
