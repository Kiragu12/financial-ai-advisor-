import { query } from '../../db/database.js';
import type {
  SummaryTotalsRow,
  WalletTotalsRow,
  GoalTotalsRow,
  CategorySpendingRow,
  CashflowRow,
} from './dashboard.types.js';

/**
 * Dashboard data access — read-only aggregation queries.
 *
 * Unlike the feature modules (one table each), a reporting module reads across
 * tables. Every query is still scoped by `user_id`, soft-deleted transactions
 * are always excluded, and transfer legs are excluded from income/expense maths.
 * Sums are COALESCEd to 0 so an account with no rows returns numbers, not nulls.
 */

/** Income & expense totals: this period (>= periodStart) and all-time. */
export async function getIncomeExpenseTotals(
  userId: string,
  periodStart: string,
): Promise<SummaryTotalsRow> {
  const { rows } = await query<SummaryTotalsRow>(
    `select
       coalesce(sum(amount) filter (where type = 'income'  and transaction_date >= $2), 0)::text as income_month,
       coalesce(sum(amount) filter (where type = 'income'), 0)::text                            as income_all,
       coalesce(sum(amount) filter (where type = 'expense' and transaction_date >= $2), 0)::text as expense_month,
       coalesce(sum(amount) filter (where type = 'expense'), 0)::text                           as expense_all
     from transactions
     where user_id = $1 and deleted_at is null and type in ('income', 'expense')`,
    [userId, periodStart],
  );
  return rows[0]!;
}

/** Aggregate balance and count across the user's active wallets. */
export async function getWalletTotals(userId: string): Promise<WalletTotalsRow> {
  const { rows } = await query<WalletTotalsRow>(
    `select
       coalesce(sum(current_balance), 0)::text as total_balance,
       count(*)::int                           as wallet_count
     from wallets
     where user_id = $1 and is_active = true`,
    [userId],
  );
  return rows[0]!;
}

/** The most common currency among active wallets, for labelling the total. */
export async function getDominantCurrency(userId: string): Promise<string | null> {
  const { rows } = await query<{ currency: string }>(
    `select currency
     from wallets
     where user_id = $1 and is_active = true
     group by currency
     order by count(*) desc
     limit 1`,
    [userId],
  );
  return rows[0]?.currency ?? null;
}

/** Goal counts and saved/target totals for active goals. */
export async function getGoalTotals(userId: string): Promise<GoalTotalsRow> {
  const { rows } = await query<GoalTotalsRow>(
    `select
       count(*) filter (where status = 'active')::int                              as active,
       count(*) filter (where status = 'completed')::int                          as completed,
       coalesce(sum(current_amount) filter (where status = 'active'), 0)::text    as total_saved,
       coalesce(sum(target_amount)  filter (where status = 'active'), 0)::text    as total_target
     from savings_goals
     where user_id = $1`,
    [userId],
  );
  return rows[0]!;
}

/** Expense totals grouped by category for a date range. */
export async function getSpendingByCategory(
  userId: string,
  from: string,
  to: string,
): Promise<CategorySpendingRow[]> {
  const { rows } = await query<CategorySpendingRow>(
    `select
       t.category_id              as category_id,
       c.name                     as category_name,
       sum(t.amount)::text        as amount
     from transactions t
     left join categories c on c.id = t.category_id
     where t.user_id = $1
       and t.type = 'expense'
       and t.deleted_at is null
       and t.transaction_date >= $2
       and t.transaction_date <= $3
     group by t.category_id, c.name
     order by sum(t.amount) desc`,
    [userId, from, to],
  );
  return rows;
}

/** Monthly income vs expense totals from a starting month onwards. */
export async function getCashflow(
  userId: string,
  fromMonthStart: string,
): Promise<CashflowRow[]> {
  const { rows } = await query<CashflowRow>(
    `select
       to_char(date_trunc('month', transaction_date), 'YYYY-MM')          as month,
       coalesce(sum(amount) filter (where type = 'income'), 0)::text      as income,
       coalesce(sum(amount) filter (where type = 'expense'), 0)::text     as expense
     from transactions
     where user_id = $1
       and deleted_at is null
       and type in ('income', 'expense')
       and transaction_date >= $2
     group by date_trunc('month', transaction_date)
     order by date_trunc('month', transaction_date) asc`,
    [userId, fromMonthStart],
  );
  return rows;
}
