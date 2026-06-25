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

export async function create(req: Request, res: Response): Promise<void> {
  const category = await categoryService.createCategory(req.user!.id, req.body);
  res.status(201).json({ category });
}

export async function update(req: Request, res: Response): Promise<void> {
  const categoryId = req.params.categoryId as string;
  const category = await categoryService.updateCategory(req.user!.id, categoryId, req.body);
  res.json({ category });
}

export async function remove(req: Request, res: Response): Promise<void> {
  const categoryId = req.params.categoryId as string;
  const category = await categoryService.deleteCategory(req.user!.id, categoryId);
  res.json({ category });
}
