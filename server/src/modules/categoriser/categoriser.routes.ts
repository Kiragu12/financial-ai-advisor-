import { Router } from 'express';
import { asyncHandler } from '../../shared/async-handler.js';
import { requireAuth } from '../../middleware/require-auth.js';
import { validate } from '../../middleware/validate.js';
import { suggestSchema } from './categoriser.schemas.js';
import * as categoriserController from './categoriser.controller.js';

/**
 * Categoriser routes — mounted at /api/categoriser. Private.
 *
 *   POST /suggest   { description, amount } → suggested expense category
 */
export const categoriserRouter = Router();

categoriserRouter.use(requireAuth);

categoriserRouter.post(
  '/suggest',
  validate({ body: suggestSchema }),
  asyncHandler(categoriserController.suggest),
);
