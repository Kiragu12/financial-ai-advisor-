import * as dashboardRepo from './dashboard.repository.js';
import type {
  DashboardSummary,
  SpendingByCategory,
  Cashflow,
} from './dashboard.types.js';

/**
 * Dashboard business logic — turns raw aggregate rows into the API response,
 * converting pg numeric strings to numbers and computing derived values
 * (net, percentages). It also owns the default date windows.
 *
 * Multi-currency note: totalBalance sums every active wallet regardless of
 * currency and reports the dominant one. The target users hold a single
 * currency (KES), so this is intentional simplicity; a true multi-currency
 * rollup would need FX rates and is out of scope.
 */

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** First day of the current month, 'YYYY-MM-01'. */
function startOfMonth(): string {
  return `${new Date().toISOString().slice(0, 7)}-01`;
}

/** First day of the month `n` months before the current one, 'YYYY-MM-01'. */
function monthsAgoStart(n: number): string {
  const d = new Date();
  d.setUTCDate(1); // avoid month-length rollover (e.g. Mar 31 → Mar 3)
  d.setUTCMonth(d.getUTCMonth() - n);
  return `${d.toISOString().slice(0, 7)}-01`;
}

export async function getSummary(userId: string): Promise<DashboardSummary> {
  const periodStart = startOfMonth();

  // Independent reads — run them together.
  const [totals, wallets, goals, currency] = await Promise.all([
    dashboardRepo.getIncomeExpenseTotals(userId, periodStart),
    dashboardRepo.getWalletTotals(userId),
    dashboardRepo.getGoalTotals(userId),
    dashboardRepo.getDominantCurrency(userId),
  ]);

  const incomeMonth = Number(totals.income_month);
  const expenseMonth = Number(totals.expense_month);

  return {
    totalBalance: Number(wallets.total_balance),
    currency: currency ?? 'KES',
    walletCount: wallets.wallet_count,
    income: { month: incomeMonth, allTime: Number(totals.income_all) },
    expense: { month: expenseMonth, allTime: Number(totals.expense_all) },
    netThisMonth: incomeMonth - expenseMonth,
    goals: {
      active: goals.active,
      completed: goals.completed,
      totalSaved: Number(goals.total_saved),
      totalTarget: Number(goals.total_target),
    },
  };
}

export async function getSpendingByCategory(
  userId: string,
  range: { from?: string; to?: string },
): Promise<SpendingByCategory> {
  const from = range.from ?? startOfMonth();
  const to = range.to ?? today();

  const rows = await dashboardRepo.getSpendingByCategory(userId, from, to);
  const total = rows.reduce((sum, row) => sum + Number(row.amount), 0);

  const categories = rows.map((row) => {
    const amount = Number(row.amount);
    return {
      categoryId: row.category_id,
      name: row.category_name ?? 'Uncategorized',
      amount,
      percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
    };
  });

  return { from, to, total, categories };
}

export async function getCashflow(
  userId: string,
  months: number,
): Promise<Cashflow> {
  // `months` is inclusive of the current month, so go back months-1.
  const fromMonthStart = monthsAgoStart(months - 1);
  const rows = await dashboardRepo.getCashflow(userId, fromMonthStart);

  return {
    months: rows.map((row) => {
      const income = Number(row.income);
      const expense = Number(row.expense);
      return { month: row.month, income, expense, net: income - expense };
    }),
  };
}
