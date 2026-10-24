import * as dashboardService from '../dashboard/dashboard.service.js';
import * as goalsService from '../goals/goals.service.js';
import * as budgetsService from '../budgets/budgets.service.js';
import * as walletRepo from '../wallets/wallets.repository.js';
import * as txnRepo from '../transactions/transactions.repository.js';
import { toWallet } from '../wallets/wallets.types.js';
import { shiftMonth } from './format.js';
import { MIN_TRANSACTIONS } from './insights/insights.rules.js';
import type { FinancialSnapshot } from './insights/insights.types.js';

/**
 * Financial snapshot builder.
 *
 * Gathers everything the advisor reasons over into one structured snapshot,
 * reusing the existing module services and repositories (the dashboard
 * aggregations stay the single source of truth for the maths — no new SQL
 * here). The insight rules, data answers and templates are pure functions of
 * this snapshot.
 */

/** Previous calendar months fed to the "own history" baseline (R1). */
const HISTORY_MONTHS = 3;

/** [first day, last day] of the month `n` months before `today`. */
function monthRange(today: string, n: number): { from: string; to: string } {
  const month = shiftMonth(today, -n);
  const nextStart = new Date(`${shiftMonth(today, -n + 1)}-01T00:00:00Z`);
  nextStart.setUTCDate(0); // last day of `month`
  return { from: `${month}-01`, to: nextStart.toISOString().slice(0, 10) };
}

export async function buildFinancialContext(userId: string): Promise<FinancialSnapshot> {
  const today = new Date().toISOString().slice(0, 10);
  const history = Array.from({ length: HISTORY_MONTHS }, (_, i) => monthRange(today, i + 1));

  const [summary, spendingThisMonth, spendingPreviousMonths, cashflow, wallets, activeGoals, budgets, recent] =
    await Promise.all([
      dashboardService.getSummary(userId),
      dashboardService.getSpendingByCategory(userId, {}),
      Promise.all(history.map((range) => dashboardService.getSpendingByCategory(userId, range))),
      dashboardService.getCashflow(userId, HISTORY_MONTHS + 1),
      walletRepo.findByUser(userId),
      goalsService.listGoals(userId, 'active'),
      budgetsService.listBudgets(userId),
      // We only need to know whether there's enough data, not the exact count.
      txnRepo.findByUser(userId, { limit: MIN_TRANSACTIONS, offset: 0 }),
    ]);

  return {
    today,
    currency: summary.currency,
    summary,
    wallets: wallets.map(toWallet).map((w) => ({ name: w.name, type: w.type, balance: w.currentBalance })),
    spendingThisMonth,
    spendingPreviousMonths,
    cashflow: cashflow.months,
    activeGoals,
    budgets,
    transactionCount: recent.length,
  };
}
