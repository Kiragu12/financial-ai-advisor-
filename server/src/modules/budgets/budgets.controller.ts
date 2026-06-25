import type { Request, Response } from 'express';
import { budgetMonthSchema } from './budgets.schemas.js';
import * as budgetService from './budgets.service.js';

export async function list(req: Request, res: Response): Promise<void> {
  const month = budgetMonthSchema.parse(req.query.month);
  const budgets = await budgetService.listBudgets(req.user!.id, month);
  res.json({ budgets });
}

export async function create(req: Request, res: Response): Promise<void> {
  const budget = await budgetService.setBudget(req.user!.id, req.body);
  res.status(201).json({ budget });
}

export async function update(req: Request, res: Response): Promise<void> {
  const budgetId = req.params.budgetId as string;
  const budget = await budgetService.updateBudget(req.user!.id, budgetId, req.body);
  res.json({ budget });
}

export async function remove(req: Request, res: Response): Promise<void> {
  const budgetId = req.params.budgetId as string;
  const budget = await budgetService.deleteBudget(req.user!.id, budgetId);
  res.json({ budget });
}
