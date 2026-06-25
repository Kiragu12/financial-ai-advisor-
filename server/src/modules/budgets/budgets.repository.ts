import { query } from '../../db/database.js';
import type { BudgetRecord, BudgetWithSpendRecord } from './budgets.types.js';

export async function findByUserWithSpend(
  userId: string,
  from: string,
  toExclusive: string,
): Promise<BudgetWithSpendRecord[]> {
  const { rows } = await query<BudgetWithSpendRecord>(
    `select
       b.*,
       c.name as category_name,
       coalesce(sum(t.amount), 0)::text as spent
     from budgets b
     join categories c on c.id = b.category_id
     left join transactions t
       on t.user_id = b.user_id
      and t.category_id = b.category_id
      and t.type = 'expense'
      and t.deleted_at is null
      and t.transaction_date >= $2
      and t.transaction_date < $3
     where b.user_id = $1
     group by b.id, c.name
     order by c.name asc`,
    [userId, from, toExclusive],
  );
  return rows;
}

export async function findById(userId: string, budgetId: string): Promise<BudgetRecord | null> {
  const { rows } = await query<BudgetRecord>(
    `select * from budgets where id = $1 and user_id = $2`,
    [budgetId, userId],
  );
  return rows[0] ?? null;
}

export async function upsertBudget(data: {
  userId: string;
  categoryId: string;
  amount: number;
}): Promise<BudgetRecord> {
  const { rows } = await query<BudgetRecord>(
    `insert into budgets (user_id, category_id, amount)
     values ($1, $2, $3)
     on conflict (user_id, category_id)
     do update set amount = excluded.amount, updated_at = now()
     returning *`,
    [data.userId, data.categoryId, data.amount],
  );
  return rows[0]!;
}

export async function updateAmount(
  userId: string,
  budgetId: string,
  amount: number,
): Promise<BudgetRecord | null> {
  const { rows } = await query<BudgetRecord>(
    `update budgets set amount = $3, updated_at = now()
     where id = $1 and user_id = $2
     returning *`,
    [budgetId, userId, amount],
  );
  return rows[0] ?? null;
}

export async function deleteBudget(
  userId: string,
  budgetId: string,
): Promise<BudgetRecord | null> {
  const { rows } = await query<BudgetRecord>(
    `delete from budgets
     where id = $1 and user_id = $2
     returning *`,
    [budgetId, userId],
  );
  return rows[0] ?? null;
}
