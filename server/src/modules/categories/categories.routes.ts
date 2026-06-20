import { Router } from 'express';
import { asyncHandler } from '../../shared/async-handler.js';
import { requireAuth } from '../../middleware/require-auth.js';
import * as categoryController from './categories.controller.js';

/**
 * Category routes — mounted at /api/categories. Private.
 *
 *   GET / (?type=income|expense)   list usable categories
 */
export const categoriesRouter = Router();

categoriesRouter.use(requireAuth);

categoriesRouter.get('/', asyncHandler(categoryController.list));
