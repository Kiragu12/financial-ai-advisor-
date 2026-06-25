import { AppError } from '../../shared/app-error.js';
import * as categoryRepo from '../categories/categories.repository.js';
import * as budgetRepo from './budgets.repository.js';
import { toBudget, type Budget } from './budgets.types.js';
import type { CreateBudgetInput, UpdateBudgetInput } from './budgets.schemas.js';

function currentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

function monthWindow(month = currentMonth()): { from: string; toExclusive: string } {
  const from = `${month}-01`;
  const next = new Date(`${from}T00:00:00.000Z`);
  next.setUTCMonth(next.getUTCMonth() + 1);
  return { from, toExclusive: next.toISOString().slice(0, 10) };
}

export async function listBudgets(userId: string, month?: string): Promise<Budget[]> {
  const { from, toExclusive } = monthWindow(month);
  const records = await budgetRepo.findByUserWithSpend(userId, from, toExclusive);
  return records.map(toBudget);
}

export async function setBudget(userId: string, input: CreateBudgetInput): Promise<Budget> {
  const category = await categoryRepo.findUsableById(userId, input.categoryId);
  if (!category) {
    throw AppError.notFound('Category not found.');
  }
  if (category.type !== 'expense') {
    throw AppError.badRequest('Budgets can only be set for expense categories.');
  }

  await budgetRepo.upsertBudget({
    userId,
    categoryId: input.categoryId,
    amount: input.amount,
  });

  const budgets = await listBudgets(userId);
  return budgets.find((budget) => budget.categoryId === input.categoryId)!;
}

export async function updateBudget(
  userId: string,
  budgetId: string,
  input: UpdateBudgetInput,
): Promise<Budget> {
  const existing = await budgetRepo.findById(userId, budgetId);
  if (!existing) {
    throw AppError.notFound('Budget not found.');
  }

  await budgetRepo.updateAmount(userId, budgetId, input.amount);
  const budgets = await listBudgets(userId);
  return budgets.find((budget) => budget.id === budgetId)!;
}

export async function deleteBudget(userId: string, budgetId: string): Promise<Budget> {
  const existing = await budgetRepo.findById(userId, budgetId);
  if (!existing) {
    throw AppError.notFound('Budget not found.');
  }

  const budgets = await listBudgets(userId);
  const budget = budgets.find((item) => item.id === budgetId)!;
  await budgetRepo.deleteBudget(userId, budgetId);
  return budget;
}
