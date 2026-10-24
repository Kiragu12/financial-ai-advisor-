/**
 * Intent routing for the advisor: decides which branch answers a message.
 *
 *   data    — "how much did I spend…", "show me…", "my balance"  → snapshot numbers
 *   advice  — "should I…", "how can I…", "help me", "am I…"       → ranked findings
 *   general — anything else                                        → knowledge base
 *
 * Advice is checked first so "how much should I save?" is treated as a request
 * for advice, not a lookup.
 */

export type Intent = 'data' | 'advice' | 'general';

const ADVICE =
  /\b(should i|how do i|how can i|how should i|help me|advice|advise|tips?|what can i do|am i|save more|cut (back|down)|recommend|suggest)\b/;
const DATA =
  /\b(how much|what did i (spend|earn)|show me|this month|last month|balance|spent|spending|my (income|budgets?|goals?|wallets?)|total)\b/;

/** Questions about the advisor itself — all stopwords, so retrieval can't catch them. */
export const ABOUT_ADVISOR = /\b(what can you do|who are you|what are you|how do you work|what do you do)\b/;

export function classifyIntent(message: string): Intent {
  const text = message.toLowerCase();
  if (ADVICE.test(text)) return 'advice';
  if (DATA.test(text)) return 'data';
  return 'general';
}

const RISKY_TOPICS =
  /\b(loans?|debts?|borrow\w*|lend\w*|invest\w*|shares|stocks|crypto|fuliza|m-?shwari|saccos?|money market|mmf|bonds?|treasury|credit|crb|helb)\b/;

/** Whether a reply on this topic needs the not-a-licensed-advisor disclaimer. */
export function touchesRiskyTopic(...texts: string[]): boolean {
  return texts.some((t) => RISKY_TOPICS.test(t.toLowerCase()));
}
