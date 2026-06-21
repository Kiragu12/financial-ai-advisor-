import * as dashboardService from '../dashboard/dashboard.service.js';
import * as walletRepo from '../wallets/wallets.repository.js';
import * as txnRepo from '../transactions/transactions.repository.js';
import { toWallet } from '../wallets/wallets.types.js';

/**
 * Financial context builder.
 *
 * Turns the user's live data into a compact, plain-language snapshot that is
 * injected into the advisor's system prompt, so Claude grounds its advice in the
 * user's actual situation instead of generic tips. It reuses the dashboard
 * aggregations (single source of truth for the maths) plus wallet and recent
 * transaction lists.
 *
 * Keep this concise: every line costs input tokens on each message.
 */
export async function buildFinancialContext(userId: string): Promise<string> {
  const [summary, spending, wallets, recentTxns] = await Promise.all([
    dashboardService.getSummary(userId),
    dashboardService.getSpendingByCategory(userId, {}),
    walletRepo.findByUser(userId),
    txnRepo.findByUser(userId, { limit: 8, offset: 0 }),
  ]);

  const cur = summary.currency;
  const money = (n: number) => `${cur} ${n.toLocaleString('en-KE')}`;

  const lines: string[] = [];
  lines.push("Here is the user's current financial snapshot. Use it to ground your advice.");
  lines.push('');

  // Headline numbers
  lines.push(
    `Total balance across ${summary.walletCount} wallet(s): ${money(summary.totalBalance)}.`,
  );
  lines.push(
    `This month — income ${money(summary.income.month)}, spending ${money(summary.expense.month)}, net ${money(summary.netThisMonth)}.`,
  );

  // Wallets
  if (wallets.length > 0) {
    const list = wallets
      .map(toWallet)
      .map((w) => `${w.name} (${w.type}): ${money(w.currentBalance)}`)
      .join('; ');
    lines.push(`Wallets: ${list}.`);
  }

  // Spending breakdown
  if (spending.categories.length > 0) {
    const top = spending.categories
      .slice(0, 5)
      .map((c) => `${c.name} ${money(c.amount)} (${c.percentage}%)`)
      .join(', ');
    lines.push(`Top spending categories this month: ${top}.`);
  }

  // Goals
  if (summary.goals.active > 0) {
    lines.push(
      `Active savings goals: ${summary.goals.active} (saved ${money(summary.goals.totalSaved)} of ${money(summary.goals.totalTarget)} target). Completed: ${summary.goals.completed}.`,
    );
  } else {
    lines.push('No active savings goals yet.');
  }

  // Recent activity
  if (recentTxns.length > 0) {
    const recent = recentTxns
      .map((t) => `${t.transaction_date} ${t.type} ${money(Number(t.amount))}${t.description ? ` (${t.description})` : ''}`)
      .join('; ');
    lines.push(`Recent transactions: ${recent}.`);
  } else {
    lines.push('No transactions recorded yet.');
  }

  return lines.join('\n');
}
