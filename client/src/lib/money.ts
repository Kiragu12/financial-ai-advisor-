// The backend already converts money columns to numbers at its mapper boundary,
// so amounts arrive as numbers here. These helpers format for display only.
// (A string is still accepted for safety, e.g. raw form input.)

const MONEY_FORMATTER = new Intl.NumberFormat('en-KE', {
  style: 'currency',
  currency: 'KES',
  currencyDisplay: 'code',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatMoney(amount: number | string): string {
  const value = typeof amount === 'number' ? amount : Number(amount);
  if (!Number.isFinite(value)) return String(amount);
  return MONEY_FORMATTER.format(value);
}
