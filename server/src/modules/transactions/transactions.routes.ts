import { Router } from 'express';
import { asyncHandler } from '../../shared/async-handler.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/require-auth.js';
import {
  createTransactionSchema,
  updateTransactionSchema,
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
 *   PATCH  /:transactionId    edit it (atomically re-adjusts wallet balances)
 *   DELETE /:transactionId    soft-delete + reverse the balance impact
 */
export const transactionsRouter = Router();

transactionsRouter.use(requireAuth);

transactionsRouter.get('/', asyncHandler(txnController.list));

transactionsRouter.get('/export.xlsx', asyncHandler(txnController.exportExcel));

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

transactionsRouter.patch(
  '/:transactionId',
  validate({ params: transactionIdParamSchema, body: updateTransactionSchema }),
  asyncHandler(txnController.update),
);

transactionsRouter.delete(
  '/:transactionId',
  validate({ params: transactionIdParamSchema }),
  asyncHandler(txnController.remove),
);
