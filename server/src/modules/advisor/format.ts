/**
 * Formatting shared by the insight rules, data answers and reply templates, so
 * every number the advisor says is rendered the same way.
 */

export function money(amount: number, currency: string): string {
  return `${currency} ${Math.round(amount).toLocaleString('en-KE')}`;
}

export function percent(part: number, whole: number): number {
  return whole > 0 ? Math.round((part / whole) * 100) : 0;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** 'YYYY-MM' (or 'YYYY-MM-DD') shifted by `delta` months → 'YYYY-MM'. */
export function shiftMonth(month: string, delta: number): string {
  const [year, mon] = month.split('-').map(Number) as [number, number];
  const d = new Date(Date.UTC(year, mon - 1 + delta, 1));
  return d.toISOString().slice(0, 7);
}

/** '2026-10-24' → '24 October 2026'. */
export function longDate(iso: string): string {
  const [year, mon, day] = iso.split('-').map(Number) as [number, number, number];
  return `${day} ${MONTHS[mon - 1]} ${year}`;
}

/** Fractional months between two 'YYYY-MM-DD' dates (b − a). */
export function monthsBetween(a: string, b: string): number {
  const ms = Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`);
  return ms / (1000 * 60 * 60 * 24 * 30.44);
}
