import { money, percent, shiftMonth } from './format.js';
import type { FinancialSnapshot } from './insights/insights.types.js';
import type { SpendingByCategory } from '../dashboard/dashboard.types.js';

/**
 * Direct answers to data questions ("how much did I spend on food this
 * month?"), read straight from the snapshot. Returns null when the message
 * isn't a question these answers cover, so the router can fall through.
 */

// Everyday words → the seeded default category they mean.
const CATEGORY_SYNONYMS: Record<string, string> = {
  food: 'Food', lunch: 'Food', meals: 'Food', eating: 'Food', groceries: 'Food',
  transport: 'Transport', fare: 'Transport', fares: 'Transport', matatu: 'Transport', boda: 'Transport', travel: 'Transport',
  rent: 'Rent', hostel: 'Rent', accommodation: 'Rent',
  airtime: 'Airtime & Data', data: 'Airtime & Data', bundles: 'Airtime & Data', internet: 'Airtime & Data',
  academic: 'Academic', fees: 'Academic', books: 'Academic', printing: 'Academic', school: 'Academic',
  entertainment: 'Entertainment', fun: 'Entertainment', netflix: 'Entertainment',
  health: 'Health', medicine: 'Health', hospital: 'Health', pharmacy: 'Health',
  'personal care': 'Personal Care', salon: 'Personal Care', barber: 'Personal Care', clothes: 'Personal Care',
};

const has = (text: string, pattern: RegExp) => pattern.test(text);

function findCategory(text: string, s: FinancialSnapshot): string | null {
  // The user's own category names (including custom ones) win over synonyms.
  const names = new Set<string>();
  for (const period of [s.spendingThisMonth, ...s.spendingPreviousMonths]) {
    for (const c of period.categories) if (c.categoryId !== null) names.add(c.name);
  }
  for (const b of s.budgets) names.add(b.categoryName);

  const byLength = [...names].sort((a, b) => b.length - a.length);
  const own = byLength.find((name) => new RegExp(`\\b${escape(name.toLowerCase())}\\b`).test(text));
  if (own) return own;

  const synonym = Object.keys(CATEGORY_SYNONYMS).find((word) =>
    new RegExp(`\\b${escape(word)}\\b`).test(text),
  );
  return synonym ? CATEGORY_SYNONYMS[synonym]! : null;
}

function escape(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function answerDataQuestion(message: string, s: FinancialSnapshot): string | null {
  const text = message.toLowerCase();
  const cur = s.currency;
  const lastMonth = has(text, /\b(last|previous) month\b/);
  const period = lastMonth ? 'last month' : 'this month';
  const lastMonthKey = shiftMonth(s.today, -1);
  const spending: SpendingByCategory | undefined = lastMonth
    ? s.spendingPreviousMonths.find((m) => m.from.startsWith(lastMonthKey))
    : s.spendingThisMonth;
  const flow = lastMonth
    ? s.cashflow.find((m) => m.month === lastMonthKey)
    : { income: s.summary.income.month, expense: s.summary.expense.month };
  const income = flow?.income ?? 0;
  const expense = flow?.expense ?? 0;

  if (has(text, /\b(balance|how much (money )?do i have|wallets?)\b/)) {
    const list = s.wallets.map((w) => `${w.name} ${money(w.balance, cur)}`).join(', ');
    return s.wallets.length === 0
      ? "You don't have any wallets yet — add one to start tracking your balance."
      : `Your total balance is ${money(s.summary.totalBalance, cur)} across ${s.wallets.length} wallet${s.wallets.length === 1 ? '' : 's'}: ${list}.`;
  }

  if (has(text, /\bbudgets?\b/)) {
    if (s.budgets.length === 0) {
      return "You haven't set any budgets yet. You can add a monthly limit per category from the Budgets page.";
    }
    const lines = s.budgets.map((b) => {
      const status = b.spent > b.amount ? `over by ${money(b.spent - b.amount, cur)}` : `${money(b.remaining, cur)} left`;
      return `- ${b.categoryName}: ${money(b.spent, cur)} of ${money(b.amount, cur)} (${status})`;
    });
    return `Here's where your budgets stand this month:\n\n${lines.join('\n')}`;
  }

  if (has(text, /\bgoals?\b/)) {
    if (s.activeGoals.length === 0) {
      return "You don't have any active savings goals yet. Setting one up in Goals lets me track your pace for you.";
    }
    const lines = s.activeGoals.map(
      (g) => `- ${g.name}: ${money(g.currentAmount, cur)} of ${money(g.targetAmount, cur)} (${g.progress}%)`,
    );
    return `Your active goals:\n\n${lines.join('\n')}`;
  }

  const category = findCategory(text, s);
  if (category) {
    const match = spending?.categories.find((c) => c.name.toLowerCase() === category.toLowerCase());
    if (!match || match.amount === 0) {
      return `You haven't recorded any ${category} spending ${period}.`;
    }
    return `You spent ${money(match.amount, cur)} on ${category} ${period} — ${percent(match.amount, spending!.total)}% of your total spending of ${money(spending!.total, cur)}.`;
  }

  if (has(text, /\b(income|earn|earned|received|got paid)\b/)) {
    return `Your recorded income ${period} is ${money(income, cur)}.`;
  }

  if (has(text, /\b(save|saved|saving|net|left over)\b/)) {
    const net = income - expense;
    const verb = lastMonth ? 'you earned' : "you've earned";
    return net >= 0
      ? `${capitalise(period)} ${verb} ${money(income, cur)} and spent ${money(expense, cur)}, so you're ${money(net, cur)} ahead (${percent(net, income)}% of income kept).`
      : `${capitalise(period)} ${verb} ${money(income, cur)} and spent ${money(expense, cur)} — ${money(-net, cur)} more than came in.`;
  }

  if (has(text, /\b(spend|spent|spending|expenses?|costs?)\b/)) {
    if (expense === 0) return `You haven't recorded any spending ${period}.`;
    const top = (spending?.categories ?? [])
      .slice(0, 3)
      .map((c) => `${c.name} ${money(c.amount, cur)} (${percent(c.amount, spending!.total)}%)`)
      .join(', ');
    const lead = lastMonth ? `Last month you spent ${money(expense, cur)}` : `You've spent ${money(expense, cur)} this month`;
    return top ? `${lead}. Biggest categories: ${top}.` : `${lead}.`;
  }

  return null;
}

function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
