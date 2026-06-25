import { Router } from 'express';
import { asyncHandler } from '../../shared/async-handler.js';
import { requireAuth } from '../../middleware/require-auth.js';
import { validate } from '../../middleware/validate.js';
import {
  categoryIdParamSchema,
  createCategorySchema,
  updateCategorySchema,
} from './categories.schemas.js';
import * as categoryController from './categories.controller.js';

/**
 * Category routes — mounted at /api/categories. Private.
 *
 *   GET / (?type=income|expense)   list usable categories
 *   POST /                         create a custom category
 *   PATCH /:categoryId             rename/restyle a custom category
 *   DELETE /:categoryId            delete an unused custom category
 */
export const categoriesRouter = Router();

categoriesRouter.use(requireAuth);

categoriesRouter.get('/', asyncHandler(categoryController.list));

categoriesRouter.post(
  '/',
  validate({ body: createCategorySchema }),
  asyncHandler(categoryController.create),
);

categoriesRouter.patch(
  '/:categoryId',
  validate({ params: categoryIdParamSchema, body: updateCategorySchema }),
  asyncHandler(categoryController.update),
);

categoriesRouter.delete(
  '/:categoryId',
  validate({ params: categoryIdParamSchema }),
  asyncHandler(categoryController.remove),
);
