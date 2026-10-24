import type { SpendingByCategory } from '../../../dashboard/dashboard.types.js';
import type { Goal } from '../../../goals/goals.types.js';
import type { FinancialSnapshot } from '../insights.types.js';

/**
 * A steady, healthy month for a student: same spending as the three months
 * before, 40% of income kept, no goals, no budgets. On its own it triggers no
 * warning — each test overrides just the fields its rule looks at.
 */

export const CATEGORY_IDS = {
  food: '00000000-0000-0000-0000-00000000f00d',
  transport: '00000000-0000-0000-0000-0000000007a0',
  rent: '00000000-0000-0000-0000-00000000ae07',
};

export function spending(
  month: string,
  items: [name: keyof typeof CATEGORY_IDS | null, amount: number][],
): SpendingByCategory {
  const total = items.reduce((sum, [, amount]) => sum + amount, 0);
  return {
    from: `${month}-01`,
    to: `${month}-28`,
    total,
    categories: items.map(([key, amount]) => ({
      categoryId: key ? CATEGORY_IDS[key] : null,
      name: key ? key[0]!.toUpperCase() + key.slice(1) : 'Uncategorized',
      amount,
      percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
    })),
  };
}

const usual: [keyof typeof CATEGORY_IDS, number][] = [
  ['rent', 5000],
  ['food', 4000],
  ['transport', 3000],
];

export function makeSnapshot(overrides: Partial<FinancialSnapshot> = {}): FinancialSnapshot {
  return {
    today: '2026-10-15',
    currency: 'KES',
    summary: {
      totalBalance: 15000,
      currency: 'KES',
      walletCount: 1,
      income: { month: 20000, allTime: 60000 },
      expense: { month: 12000, allTime: 36000 },
      netThisMonth: 8000,
      goals: { active: 0, completed: 0, totalSaved: 0, totalTarget: 0 },
    },
    wallets: [{ name: 'M-Pesa', type: 'mobile_money', balance: 15000 }],
    spendingThisMonth: spending('2026-10', usual),
    spendingPreviousMonths: [
      spending('2026-09', usual),
      spending('2026-08', usual),
      spending('2026-07', usual),
    ],
    cashflow: [
      { month: '2026-08', income: 20000, expense: 12000, net: 8000 },
      { month: '2026-09', income: 20000, expense: 12000, net: 8000 },
      { month: '2026-10', income: 20000, expense: 12000, net: 8000 },
    ],
    activeGoals: [],
    budgets: [],
    transactionCount: 5,
    ...overrides,
  };
}

export function withMonth(income: number, expense: number): Partial<FinancialSnapshot> {
  const base = makeSnapshot().summary;
  return {
    summary: {
      ...base,
      income: { ...base.income, month: income },
      expense: { ...base.expense, month: expense },
      netThisMonth: income - expense,
    },
  };
}

export function goal(overrides: Partial<Goal> = {}): Goal {
  const targetAmount = overrides.targetAmount ?? 60000;
  const currentAmount = overrides.currentAmount ?? 10000;
  return {
    id: 'goal-1',
    name: 'Laptop',
    targetAmount,
    currentAmount,
    deadline: '2027-04-15',
    status: 'active',
    progress: Math.min(100, Math.round((currentAmount / targetAmount) * 100)),
    createdAt: '2026-06-15T00:00:00.000Z',
    updatedAt: '2026-06-15T00:00:00.000Z',
    ...overrides,
  };
}
