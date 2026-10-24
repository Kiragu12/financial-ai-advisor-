import { RULES, noData } from './insights.rules.js';
import type { FinancialSnapshot, Finding } from './insights.types.js';

/**
 * Run every rule against the snapshot and return the findings, most important
 * first. With too little data, the only finding is the plain "not enough data
 * yet" message — no analysis is invented from a handful of transactions.
 */
export function runInsights(snapshot: FinancialSnapshot): Finding[] {
  const insufficient = noData(snapshot);
  if (insufficient) return [insufficient];

  return RULES.map((rule) => rule(snapshot))
    .filter((finding): finding is Finding => finding !== null)
    .sort((a, b) => b.score - a.score);
}
