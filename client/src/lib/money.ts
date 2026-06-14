// Money is always a decimal string from the backend (e.g. "1500.00" KES).
// These helpers format strings for display only. Never do arithmetic on money.

const MONEY_FORMATTER = new Intl.NumberFormat('en-KE', {
  style: 'currency',
  currency: 'KES',
  currencyDisplay: 'code',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatMoney(amount: string): string {
  const value = Number(amount);
  if (!Number.isFinite(value)) return amount;
  return MONEY_FORMATTER.format(value);
}
