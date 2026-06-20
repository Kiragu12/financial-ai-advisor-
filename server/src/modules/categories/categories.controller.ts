import type { Request, Response } from 'express';
import * as categoryService from './categories.service.js';
import type { CategoryType } from './categories.types.js';

export async function list(req: Request, res: Response): Promise<void> {
  // Optional ?type=income|expense filter. Anything else is ignored.
  const rawType = req.query.type;
  const type =
    rawType === 'income' || rawType === 'expense'
      ? (rawType as CategoryType)
      : undefined;

  const categories = await categoryService.listCategories(req.user!.id, type);
  res.json({ categories });
}
