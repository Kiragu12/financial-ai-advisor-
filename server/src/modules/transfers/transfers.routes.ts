import { Router } from 'express';
import { asyncHandler } from '../../shared/async-handler.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/require-auth.js';
import { createTransferSchema, transferIdParamSchema } from './transfers.schemas.js';
import * as transferController from './transfers.controller.js';

/**
 * Transfer routes — mounted at /api/transfers. Every route is private.
 *
 *   GET    /              list transfers (history)
 *   POST   /              move money between two of the user's wallets
 *   GET    /:transferId   fetch one transfer
 *
 * Note: reversing/deleting a transfer is deferred — it must undo both legs and
 * both balances, and is best built alongside transaction editing.
 */
export const transfersRouter = Router();

transfersRouter.use(requireAuth);

transfersRouter.get('/', asyncHandler(transferController.list));

transfersRouter.post(
  '/',
  validate({ body: createTransferSchema }),
  asyncHandler(transferController.create),
);

transfersRouter.get(
  '/:transferId',
  validate({ params: transferIdParamSchema }),
  asyncHandler(transferController.get),
);
