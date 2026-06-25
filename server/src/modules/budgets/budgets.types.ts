/**
 * Budget shapes.
 *
 * A budget is a recurring monthly spending limit for one expense category.
 * The list/read shape is enriched with the category name and the current
 * period's spend so the client can render a progress bar without extra calls.
 * Money columns arrive from pg as strings; converted to numbers in the mapper.
 */

export interface BudgetRecord {
  id: string;
  user_id: string;
  category_id: string;
  amount: string;
  created_at: Date;
  updated_at: Date;
}

/** A budget row joined with its category name and the period's spend. */
export interface BudgetWithSpendRecord extends BudgetRecord {
  category_name: string;
  spent: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  categoryName: string;
  amount: number;
  spent: number;
  remaining: number; // amount - spent (can be negative when over budget)
  percentage: number; // spent / amount, 0–100 (capped for the bar)
  createdAt: string;
  updatedAt: string;
}

export function toBudget(record: BudgetWithSpendRecord): Budget {
  const amount = Number(record.amount);
  const spent = Number(record.spent);
  const percentage = amount > 0 ? Math.min(100, Math.round((spent / amount) * 100)) : 0;

  return {
    id: record.id,
    categoryId: record.category_id,
    categoryName: record.category_name,
    amount,
    spent,
    remaining: amount - spent,
    percentage,
    createdAt: record.created_at.toISOString(),
    updatedAt: record.updated_at.toISOString(),
  };
}
