import { Router } from 'express';
import { asyncHandler } from '../../shared/async-handler.js';
import { requireAuth } from '../../middleware/require-auth.js';
import * as dashboardController from './dashboard.controller.js';

/**
 * Dashboard routes — mounted at /api/dashboard. Every route is private and
 * read-only.
 *
 *   GET /summary               headline stats (balance, month income/expense, goals)
 *   GET /spending-by-category  expense breakdown for a date range (?from=&to=)
 *   GET /cashflow              monthly income vs expense (?months=)
 */
export const dashboardRouter = Router();

dashboardRouter.use(requireAuth);

dashboardRouter.get('/summary', asyncHandler(dashboardController.summary));
dashboardRouter.get(
  '/spending-by-category',
  asyncHandler(dashboardController.spendingByCategory),
);
dashboardRouter.get('/cashflow', asyncHandler(dashboardController.cashflow));
