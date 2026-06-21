import type { Request, Response } from 'express';
import { spendingQuerySchema, cashflowQuerySchema } from './dashboard.schemas.js';
import * as dashboardService from './dashboard.service.js';

/**
 * HTTP layer for the dashboard. requireAuth runs first (see routes), so
 * `req.user` is always present. Query strings are parsed here (Express 5 makes
 * req.query read-only, so the validate middleware can't rewrite it).
 */

export async function summary(req: Request, res: Response): Promise<void> {
  const data = await dashboardService.getSummary(req.user!.id);
  res.json({ summary: data });
}

export async function spendingByCategory(
  req: Request,
  res: Response,
): Promise<void> {
  const range = spendingQuerySchema.parse(req.query);
  const data = await dashboardService.getSpendingByCategory(req.user!.id, range);
  res.json(data);
}

export async function cashflow(req: Request, res: Response): Promise<void> {
  const { months } = cashflowQuerySchema.parse(req.query);
  const data = await dashboardService.getCashflow(req.user!.id, months);
  res.json(data);
}
