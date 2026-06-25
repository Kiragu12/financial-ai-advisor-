import { Router } from 'express';
import { asyncHandler } from '../../shared/async-handler.js';
import { requireAuth } from '../../middleware/require-auth.js';
import { validate } from '../../middleware/validate.js';
import {
  budgetIdParamSchema,
  createBudgetSchema,
  updateBudgetSchema,
} from './budgets.schemas.js';
import * as budgetController from './budgets.controller.js';

export const budgetsRouter = Router();

budgetsRouter.use(requireAuth);

budgetsRouter.get('/', asyncHandler(budgetController.list));

budgetsRouter.post(
  '/',
  validate({ body: createBudgetSchema }),
  asyncHandler(budgetController.create),
);

budgetsRouter.patch(
  '/:budgetId',
  validate({ params: budgetIdParamSchema, body: updateBudgetSchema }),
  asyncHandler(budgetController.update),
);

budgetsRouter.delete(
  '/:budgetId',
  validate({ params: budgetIdParamSchema }),
  asyncHandler(budgetController.remove),
);
