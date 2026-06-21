/**
 * Dashboard shapes — read-only analytics assembled from several tables.
 *
 * Everything here is the *output* contract (camelCase, numbers). The repository
 * returns raw rows where money columns are pg strings; the service converts them
 * to numbers via the mappers below, so Number() lives in exactly one place.
 *
 * Money note: transfers (transfer_in / transfer_out) are deliberately excluded
 * from income, expense and cashflow — they move money between a user's own
 * wallets and are not real income or spending.
 */

export interface DashboardSummary {
  totalBalance: number; // sum of active wallet balances
  currency: string; // dominant wallet currency (see service note on multi-currency)
  walletCount: number;
  income: { month: number; allTime: number };
  expense: { month: number; allTime: number };
  netThisMonth: number; // income.month - expense.month
  goals: {
    active: number;
    completed: number;
    totalSaved: number; // current_amount summed across active goals
    totalTarget: number; // target_amount summed across active goals
  };
}

export interface CategorySpending {
  categoryId: string | null;
  name: string; // 'Uncategorized' when a transaction has no category
  amount: number;
  percentage: number; // share of the period's total spend, 0–100
}

export interface SpendingByCategory {
  from: string; // 'YYYY-MM-DD'
  to: string; // 'YYYY-MM-DD'
  total: number;
  categories: CategorySpending[];
}

export interface CashflowMonth {
  month: string; // 'YYYY-MM'
  income: number;
  expense: number;
  net: number; // income - expense
}

export interface Cashflow {
  months: CashflowMonth[];
}

// --- Raw row shapes returned by the repository (money/counts as pg strings) ---

export interface SummaryTotalsRow {
  income_month: string;
  income_all: string;
  expense_month: string;
  expense_all: string;
}

export interface WalletTotalsRow {
  total_balance: string;
  wallet_count: number;
}

export interface GoalTotalsRow {
  active: number;
  completed: number;
  total_saved: string;
  total_target: string;
}

export interface CategorySpendingRow {
  category_id: string | null;
  category_name: string | null;
  amount: string;
}

export interface CashflowRow {
  month: string;
  income: string;
  expense: string;
}
