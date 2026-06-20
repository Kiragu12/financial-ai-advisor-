import { Router } from 'express';
import { asyncHandler } from '../../shared/async-handler.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/require-auth.js';
import {
  createTransactionSchema,
  transactionIdParamSchema,
} from './transactions.schemas.js';
import * as txnController from './transactions.controller.js';

/**
 * Transaction routes — mounted at /api/transactions. Every route is private.
 *
 *   GET    /                  list (filters: walletId, categoryId, type,
 *                             from, to, limit, offset)
 *   POST   /                  record an income/expense (moves wallet balance)
 *   GET    /:transactionId    fetch one
 *   DELETE /:transactionId    soft-delete + reverse the balance impact
 *
 * Note: PATCH (editing an existing transaction) is intentionally deferred —
 * it requires reversing the old balance impact and applying the new one, and
 * is best built alongside transfers in a later sprint.
 */
export const transactionsRouter = Router();

transactionsRouter.use(requireAuth);

transactionsRouter.get('/', asyncHandler(txnController.list));

transactionsRouter.post(
  '/',
  validate({ body: createTransactionSchema }),
  asyncHandler(txnController.create),
);

transactionsRouter.get(
  '/:transactionId',
  validate({ params: transactionIdParamSchema }),
  asyncHandler(txnController.get),
);

transactionsRouter.delete(
  '/:transactionId',
  validate({ params: transactionIdParamSchema }),
  asyncHandler(txnController.remove),
);
