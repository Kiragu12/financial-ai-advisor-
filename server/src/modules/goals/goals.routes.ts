import { Router } from 'express';
import { asyncHandler } from '../../shared/async-handler.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/require-auth.js';
import {
  createGoalSchema,
  updateGoalSchema,
  createContributionSchema,
  goalIdParamSchema,
} from './goals.schemas.js';
import * as goalController from './goals.controller.js';

/**
 * Goal routes — mounted at /api/goals. Every route is private.
 *
 *   GET    /                       list goals (optional ?status= filter)
 *   POST   /                       create a goal
 *   GET    /:goalId                fetch one goal
 *   PATCH  /:goalId                update a goal (metadata / status)
 *   GET    /:goalId/contributions  list a goal's contributions
 *   POST   /:goalId/contributions  contribute (optionally drawn from a wallet)
 */
export const goalsRouter = Router();

goalsRouter.use(requireAuth);

goalsRouter.get('/', asyncHandler(goalController.list));

goalsRouter.post(
  '/',
  validate({ body: createGoalSchema }),
  asyncHandler(goalController.create),
);

goalsRouter.get(
  '/:goalId',
  validate({ params: goalIdParamSchema }),
  asyncHandler(goalController.get),
);

goalsRouter.patch(
  '/:goalId',
  validate({ params: goalIdParamSchema, body: updateGoalSchema }),
  asyncHandler(goalController.update),
);

goalsRouter.get(
  '/:goalId/contributions',
  validate({ params: goalIdParamSchema }),
  asyncHandler(goalController.listContributions),
);

goalsRouter.post(
  '/:goalId/contributions',
  validate({ params: goalIdParamSchema, body: createContributionSchema }),
  asyncHandler(goalController.contribute),
);
