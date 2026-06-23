import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { CashflowMonth } from '../../api/types';
import { formatMoney } from '../../lib/money';

/**
 * Monthly income vs expense bars. Data comes straight from
 * GET /api/dashboard/cashflow; transfers are already excluded server-side.
 */

/** 'YYYY-MM' -> short month label e.g. 'Jun'. */
function monthLabel(ym: string): string {
  const date = new Date(`${ym}-01T00:00:00`);
  if (Number.isNaN(date.getTime())) return ym;
  return date.toLocaleString('en-GB', { month: 'short' });
}

export function CashflowChart({ months }: { months: CashflowMonth[] }) {
  const data = months.map((m) => ({
    label: monthLabel(m.month),
    income: m.income,
    expense: m.expense,
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
            width={48}
            tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : `${v}`)}
          />
          <Tooltip
            formatter={(value, name) => [formatMoney(Number(value)), name === 'income' ? 'Income' : 'Expense']}
            cursor={{ fill: 'var(--surface-2)' }}
          />
          <Legend
            formatter={(value) => (value === 'income' ? 'Income' : 'Expense')}
            iconType="circle"
          />
          <Bar dataKey="income" fill="var(--income)" radius={[4, 4, 0, 0]} maxBarSize={28} />
          <Bar dataKey="expense" fill="var(--expense)" radius={[4, 4, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
