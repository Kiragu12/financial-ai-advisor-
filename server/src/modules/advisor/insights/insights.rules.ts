import { longDate, money, monthsBetween, percent, shiftMonth } from '../format.js';
import type { Rule } from './insights.types.js';
import type { Goal } from '../../goals/goals.types.js';

/**
 * Insight rules — the reasoning layer of the self-hosted advisor.
 *
 * Each rule is a pure function (snapshot) => Finding | null. Every number in a
 * finding comes straight from the snapshot, so any sentence the advisor says
 * can be traced to one rule and one figure. The comparison baseline is always
 * the user's OWN history — there is no cohort to compare against.
 */

/** Below this many transactions we say so plainly instead of analysing. */
export const MIN_TRANSACTIONS = 5;

// Fixed, lumpy costs (rent, fees) aren't discretionary: a "spike" when fees fall
// due or a big rent share isn't something the student can act on this month.
const FIXED_COSTS = new Set(['rent', 'academic']);
const SPIKE_RATIO = 1.5;
const MIN_SPIKE_AMOUNT = 500;
const DOMINANCE_SHARE = 0.4;
const LOW_SAVINGS_RATE = 0.1;
const HEALTHY_SAVINGS_RATE = 0.2;
const UNCATEGORISED_SHARE = 0.3;

const isFixedCost = (name: string) => FIXED_COSTS.has(name.toLowerCase());
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

function lastMonths(n: number): string {
  return n === 1 ? 'last month' : `the last ${n} months`;
}

/** R1 — a discretionary category is well above its own recent average. */
export const categorySpike: Rule = (s) => {
  const history = s.spendingPreviousMonths.filter((m) => m.total > 0);
  if (history.length === 0) return null;

  let best: { name: string; id: string; amount: number; average: number; ratio: number } | null =
    null;
  for (const c of s.spendingThisMonth.categories) {
    if (c.categoryId === null || isFixedCost(c.name) || c.amount < MIN_SPIKE_AMOUNT) continue;
    const past = history.map(
      (m) => m.categories.find((p) => p.categoryId === c.categoryId)?.amount ?? 0,
    );
    const average = past.reduce((sum, v) => sum + v, 0) / history.length;
    if (average <= 0) continue;
    const ratio = c.amount / average;
    if (ratio > SPIKE_RATIO && (!best || ratio > best.ratio)) {
      best = { name: c.name, id: c.categoryId, amount: c.amount, average, ratio };
    }
  }
  if (!best) return null;

  const cur = s.currency;
  return {
    id: `category-spike:${best.id}`,
    severity: 'warning',
    category: best.name,
    title: `${best.name} spending is up`,
    detail: `You've spent ${money(best.amount, cur)} on ${best.name} so far this month — ${best.ratio.toFixed(1)}× your average of ${money(best.average, cur)} over ${lastMonths(history.length)}.`,
    suggestion: `Cap ${best.name} at about ${money(best.average / 4, cur)} a week for the rest of the month to get back to your usual level.`,
    score: Math.round(clamp(55 + (best.ratio - SPIKE_RATIO) * 15, 55, 85)),
  };
};

/** R2 — one discretionary category takes a large share of this month's spending. */
export const categoryDominance: Rule = (s) => {
  const { total, categories } = s.spendingThisMonth;
  if (total <= 0) return null;
  const top = categories
    .filter((c) => c.categoryId !== null && !isFixedCost(c.name))
    .sort((a, b) => b.amount - a.amount)[0];
  if (!top || top.amount / total <= DOMINANCE_SHARE) return null;

  const share = top.amount / total;
  return {
    id: `category-dominance:${top.categoryId}`,
    severity: share > 0.6 ? 'warning' : 'info',
    category: top.name,
    title: `${top.name} dominates your spending`,
    detail: `${top.name} makes up ${percent(top.amount, total)}% of your spending this month (${money(top.amount, s.currency)} of ${money(total, s.currency)}).`,
    suggestion: `Look over your recent ${top.name} transactions and pick one regular purchase to skip this week.`,
    score: Math.round(clamp(35 + share * 40, 35, 70)),
  };
};

/** R3 — spending exceeds income this month. */
export const negativeNet: Rule = (s) => {
  const income = s.summary.income.month;
  const expense = s.summary.expense.month;
  if (expense <= 0 || expense <= income) return null;

  const cur = s.currency;
  if (income === 0) {
    return {
      id: 'negative-net',
      severity: 'critical',
      title: 'Spending with no income recorded',
      detail: `You've spent ${money(expense, cur)} this month and no income is recorded yet.`,
      suggestion:
        "If your allowance, HELB or pay has already come in this month, log it so your numbers reflect reality.",
      score: 85,
    };
  }
  return {
    id: 'negative-net',
    severity: 'critical',
    title: 'Spending more than you earn',
    detail: `You've spent ${money(expense, cur)} this month against ${money(income, cur)} of income — ${money(expense - income, cur)} more than came in.`,
    suggestion: 'Hold off on non-essential spending until your next income arrives.',
    score: 90,
  };
};

/** R4 — keeping less than 10% of this month's income. */
export const lowSavingsRate: Rule = (s) => {
  const income = s.summary.income.month;
  const net = s.summary.netThisMonth;
  if (income <= 0 || net < 0 || net / income >= LOW_SAVINGS_RATE) return null;

  const cur = s.currency;
  return {
    id: 'low-savings-rate',
    severity: 'warning',
    title: 'Low savings rate',
    detail: `You've kept ${percent(net, income)}% of this month's income (${money(net, cur)} of ${money(income, cur)}).`,
    suggestion: `When your next income lands, move 10% of it (about ${money(income * LOW_SAVINGS_RATE, cur)}) into savings before you spend anything.`,
    score: 60,
  };
};

interface GoalPace {
  goal: Goal;
  monthsLeft: number;
  required: number; // per month, to hit the deadline
  pace: number; // per month, so far
}

function goalPace(goal: Goal, today: string): GoalPace | null {
  if (!goal.deadline) return null;
  const remaining = goal.targetAmount - goal.currentAmount;
  if (remaining <= 0) return null;
  const monthsLeft = monthsBetween(today, goal.deadline);
  const monthsActive = Math.max(1, monthsBetween(goal.createdAt.slice(0, 10), today));
  return {
    goal,
    monthsLeft,
    required: monthsLeft > 0 ? remaining / Math.max(1, monthsLeft) : remaining,
    pace: goal.currentAmount / monthsActive,
  };
}

/** R5 — a goal needs a higher monthly rate than the user has managed so far. */
export const goalOffPace: Rule = (s) => {
  const paces = s.activeGoals
    .map((g) => goalPace(g, s.today))
    .filter((p): p is GoalPace => p !== null);
  const cur = s.currency;

  const overdue = paces.find((p) => p.monthsLeft <= 0);
  if (overdue) {
    const { goal } = overdue;
    return {
      id: `goal-overdue:${goal.id}`,
      severity: 'critical',
      title: `"${goal.name}" is past its deadline`,
      detail: `"${goal.name}" passed its deadline of ${longDate(goal.deadline!)} with ${money(goal.targetAmount - goal.currentAmount, cur)} still to go.`,
      suggestion: `Set a new, realistic deadline for "${goal.name}" so you can track it again.`,
      score: 80,
    };
  }

  const behind = paces
    .filter((p) => p.pace < p.required)
    .sort((a, b) => b.required - b.pace - (a.required - a.pace))[0];
  if (!behind) return null;

  const { goal } = behind;
  return {
    id: `goal-off-pace:${goal.id}`,
    severity: 'warning',
    title: `"${goal.name}" is behind schedule`,
    detail: `To reach "${goal.name}" (${money(goal.targetAmount, cur)}) by ${longDate(goal.deadline!)} you need about ${money(behind.required, cur)} a month; so far you've averaged ${money(behind.pace, cur)} a month.`,
    suggestion: `Set aside ${money(behind.required, cur)} for "${goal.name}" as soon as your income arrives each month.`,
    score: Math.round(clamp(55 + (1 - behind.pace / behind.required) * 25, 55, 80)),
  };
};

/** R6 — actual spending exceeds a budget (the worst breach). */
export const budgetBreach: Rule = (s) => {
  const worst = s.budgets
    .filter((b) => b.amount > 0 && b.spent > b.amount)
    .sort((a, b) => b.spent / b.amount - a.spent / a.amount)[0];
  if (!worst) return null;

  const cur = s.currency;
  return {
    id: `budget-breach:${worst.id}`,
    severity: 'critical',
    category: worst.categoryName,
    title: `Over your ${worst.categoryName} budget`,
    detail: `You've spent ${money(worst.spent, cur)} on ${worst.categoryName} against a ${money(worst.amount, cur)} budget — ${money(worst.spent - worst.amount, cur)} over.`,
    suggestion: `Keep ${worst.categoryName} to essentials only for the rest of the month — skip anything you could do without until the 1st.`,
    score: Math.round(clamp(70 + (worst.spent / worst.amount - 1) * 20, 70, 88)),
  };
};

/** R7 — too much spending has no category for the analysis to be reliable. */
export const uncategorisedCoverage: Rule = (s) => {
  const { total, categories } = s.spendingThisMonth;
  const uncategorised = categories
    .filter((c) => c.categoryId === null)
    .reduce((sum, c) => sum + c.amount, 0);
  if (total <= 0 || uncategorised / total <= UNCATEGORISED_SHARE) return null;

  return {
    id: 'uncategorised-coverage',
    severity: 'info',
    title: 'Lots of uncategorised spending',
    detail: `${percent(uncategorised, total)}% of this month's spending (${money(uncategorised, s.currency)}) has no category, so I can only see part of the picture.`,
    suggestion:
      'Open Transactions and add categories to those expenses — the form now suggests one as you type.',
    score: 40,
  };
};

/** R8 — something is going well. Tries several signals and returns the first found. */
export const positiveStreak: Rule = (s) => {
  const cur = s.currency;
  const lastMonth = shiftMonth(s.today, -1);
  const monthBefore = shiftMonth(s.today, -2);
  const prev = s.cashflow.find((m) => m.month === lastMonth);
  const prevPrev = s.cashflow.find((m) => m.month === monthBefore);

  // Compare two COMPLETE months — comparing a part-month to a full one would
  // always look like an improvement early in the month.
  if (prev && prevPrev && prevPrev.expense > 0 && prev.expense < prevPrev.expense) {
    return {
      id: 'positive-spending-down',
      severity: 'positive',
      title: 'Spending is down',
      detail: `Last month you spent ${money(prev.expense, cur)}, ${percent(prevPrev.expense - prev.expense, prevPrev.expense)}% less than the ${money(prevPrev.expense, cur)} the month before.`,
      score: 30,
    };
  }

  const income = s.summary.income.month;
  if (income > 0 && s.summary.netThisMonth / income >= HEALTHY_SAVINGS_RATE) {
    return {
      id: 'positive-savings-rate',
      severity: 'positive',
      title: 'Healthy savings rate',
      detail: `You've kept ${percent(s.summary.netThisMonth, income)}% of this month's income so far — well above the 20% many people aim for.`,
      score: 30,
    };
  }

  const onTrack = s.activeGoals
    .map((g) => goalPace(g, s.today))
    .find((p) => p !== null && p.monthsLeft > 0 && p.pace >= p.required);
  if (onTrack) {
    return {
      id: `positive-goal-on-track:${onTrack.goal.id}`,
      severity: 'positive',
      title: `"${onTrack.goal.name}" is on track`,
      detail: `At your current pace you're on track to reach "${onTrack.goal.name}" by ${longDate(onTrack.goal.deadline!)} (${onTrack.goal.progress}% saved).`,
      score: 25,
    };
  }

  const halfway = s.activeGoals.find((g) => g.progress >= 50);
  if (halfway) {
    return {
      id: `positive-goal-progress:${halfway.id}`,
      severity: 'positive',
      title: `Over halfway to "${halfway.name}"`,
      detail: `You've saved ${money(halfway.currentAmount, cur)} of ${money(halfway.targetAmount, cur)} for "${halfway.name}" — ${halfway.progress}% of the way there.`,
      score: 20,
    };
  }
  return null;
};

/** R9 — too little data to analyse. Say so plainly instead of inventing analysis. */
export const noData: Rule = (s) => {
  if (s.transactionCount >= MIN_TRANSACTIONS) return null;
  const n = s.transactionCount;
  return {
    id: 'no-data',
    severity: 'info',
    title: 'Not enough data yet',
    detail:
      n === 0
        ? "You haven't logged any transactions yet, so I have nothing to analyse."
        : `You've logged ${n} transaction${n === 1 ? '' : 's'} so far — not enough for me to spot real patterns yet.`,
    suggestion:
      'Log your spending for the next week (the form suggests a category as you type), then ask me again.',
    score: 100,
  };
};

export const RULES: Rule[] = [
  categorySpike,
  categoryDominance,
  negativeNet,
  lowSavingsRate,
  goalOffPace,
  budgetBreach,
  uncategorisedCoverage,
  positiveStreak,
];
