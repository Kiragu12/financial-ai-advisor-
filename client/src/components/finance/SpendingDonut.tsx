import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { CategorySpending } from '../../api/types';
import { formatMoney } from '../../lib/money';

/**
 * Donut of this month's spending by category, with a legend listing the exact
 * amount and share. Data from GET /api/dashboard/spending-by-category.
 */

// Distinct, theme-friendly slice colours (oklch, varied hues).
const PALETTE = [
  'var(--primary)',
  'oklch(60% 0.16 28)', // red
  'oklch(50% 0.13 70)', // amber
  'oklch(56% 0.13 158)', // green
  'oklch(56% 0.13 265)', // violet
  'oklch(56% 0.13 220)', // blue
  'oklch(60% 0.13 330)', // pink
  'oklch(60% 0.13 130)', // lime
];

function colorAt(i: number): string {
  return PALETTE[i % PALETTE.length]!;
}

export function SpendingDonut({ categories }: { categories: CategorySpending[] }) {
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="h-44 w-44 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categories}
              dataKey="amount"
              nameKey="name"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              stroke="none"
            >
              {categories.map((c, i) => (
                <Cell key={c.categoryId ?? `c-${i}`} fill={colorAt(i)} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatMoney(Number(value))} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className="min-w-0 flex-1 space-y-2">
        {categories.map((c, i) => (
          <li key={c.categoryId ?? `c-${i}`} className="flex items-center gap-2 text-sm">
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: colorAt(i) }}
              aria-hidden="true"
            />
            <span className="min-w-0 flex-1 truncate text-ink">{c.name}</span>
            <span className="num font-medium text-ink">{formatMoney(c.amount)}</span>
            <span className="w-9 text-right text-xs text-ink-3">{c.percentage}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
