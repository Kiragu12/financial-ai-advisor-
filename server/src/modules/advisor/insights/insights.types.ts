import type {
  CashflowMonth,
  DashboardSummary,
  SpendingByCategory,
} from '../../dashboard/dashboard.types.js';
import type { Goal } from '../../goals/goals.types.js';
import type { Budget } from '../../budgets/budgets.types.js';

/**
 * Insight engine shapes.
 *
 * The snapshot is everything the advisor knows about a user, assembled from
 * existing module services by advisor.context.ts. Rules and replies are pure
 * functions of it — no I/O — so each is unit-testable with a fixture.
 */

export interface FinancialSnapshot {
  today: string; // 'YYYY-MM-DD' — rules never read the clock themselves
  currency: string;
  summary: DashboardSummary;
  wallets: { name: string; type: string; balance: number }[];
  spendingThisMonth: SpendingByCategory;
  /** Up to three previous calendar months, most recent first. */
  spendingPreviousMonths: SpendingByCategory[];
  /** Monthly income/expense, oldest first, current month last (months with no activity are absent). */
  cashflow: CashflowMonth[];
  activeGoals: Goal[];
  budgets: Budget[];
  /** Transactions recorded, capped at the no-data threshold (we only need to know "enough or not"). */
  transactionCount: number;
}

export type Severity = 'critical' | 'warning' | 'info' | 'positive';

export interface Finding {
  id: string;
  severity: Severity;
  category?: string;
  title: string;
  detail: string; // one sentence, with real numbers
  suggestion?: string; // one actionable sentence
  score: number; // 0–100, for ranking
}

export type Rule = (snapshot: FinancialSnapshot) => Finding | null;
