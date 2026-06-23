// A small, curated set of money/saving quotes shown on the dashboard.
// Deduplicated and balanced across authors. Rotates by the day so the same
// quote shows all day and a different one appears tomorrow.

export interface Quote {
  text: string;
  author: string;
}

export const MONEY_QUOTES: Quote[] = [
  { text: 'Time is money.', author: 'Benjamin Franklin' },
  { text: 'Wealth consists not in having great possessions, but in having few wants.', author: 'Epictetus' },
  { text: 'Money often costs too much.', author: 'Ralph Waldo Emerson' },
  { text: 'It is not the man who has too little, but the man who craves more, that is poor.', author: 'Seneca' },
  { text: 'Without frugality none can be rich, and with it very few would be poor.', author: 'Samuel Johnson' },
  { text: 'Beware of little expenses; a small leak will sink a great ship.', author: 'Benjamin Franklin' },
  { text: 'A penny saved is a penny earned.', author: 'Benjamin Franklin' },
  { text: 'Money is a good servant but a bad master.', author: 'Francis Bacon' },
  { text: 'Riches do not exhilarate us so much with their possession as they torment us with their loss.', author: 'Epicurus' },
  { text: 'Make money your god, and it will plague you like the devil.', author: 'Henry Fielding' },
];

/** Day-of-year, so the quote is stable for a whole day and changes the next. */
function dayOfYear(date = new Date()): number {
  const start = Date.UTC(date.getFullYear(), 0, 0);
  const now = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor((now - start) / 86_400_000);
}

/** The quote for today — deterministic, rotates daily through the list. */
export function quoteOfTheDay(date = new Date()): Quote {
  return MONEY_QUOTES[dayOfYear(date) % MONEY_QUOTES.length]!;
}
