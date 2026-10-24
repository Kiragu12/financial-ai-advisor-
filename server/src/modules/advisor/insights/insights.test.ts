import { describe, expect, it } from 'vitest';
import {
  budgetBreach,
  categoryDominance,
  categorySpike,
  goalOffPace,
  lowSavingsRate,
  negativeNet,
  noData,
  positiveStreak,
  uncategorisedCoverage,
} from './insights.rules.js';
import { runInsights } from './insights.service.js';
import { goal, makeSnapshot, spending, withMonth } from './__fixtures__/snapshot.js';
import type { Budget } from '../../budgets/budgets.types.js';

const budget = (amount: number, spent: number): Budget => ({
  id: 'budget-1',
  categoryId: 'cat-food',
  categoryName: 'Food',
  amount,
  spent,
  remaining: amount - spent,
  percentage: Math.min(100, Math.round((spent / amount) * 100)),
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
});

describe('R1 category spike', () => {
  it('fires when a category is over 1.5x its own average', () => {
    const s = makeSnapshot({
      spendingThisMonth: spending('2026-10', [['rent', 5000], ['food', 9000], ['transport', 3000]]),
    });
    const f = categorySpike(s)!;
    expect(f.category).toBe('Food');
    expect(f.detail).toContain('KES 9,000');
    expect(f.detail).toContain('2.3×');
  });

  it('ignores fixed costs and normal months', () => {
    expect(categorySpike(makeSnapshot())).toBeNull();
    const rentSpike = makeSnapshot({
      spendingThisMonth: spending('2026-10', [['rent', 15000], ['food', 4000]]),
    });
    expect(categorySpike(rentSpike)).toBeNull();
  });
});

describe('R2 category dominance', () => {
  it('fires when one discretionary category is over 40% of spending', () => {
    const s = makeSnapshot({
      spendingThisMonth: spending('2026-10', [['food', 6000], ['transport', 2000]]),
    });
    expect(categoryDominance(s)?.detail).toContain('75%');
  });

  it('does not fire for a balanced month', () => {
    expect(categoryDominance(makeSnapshot())).toBeNull();
  });
});

describe('R3 negative net', () => {
  it('fires when expenses exceed income', () => {
    const f = negativeNet(makeSnapshot(withMonth(8000, 12000)))!;
    expect(f.severity).toBe('critical');
    expect(f.detail).toContain('KES 4,000 more than came in');
  });

  it('names the missing-income case instead of a misleading gap', () => {
    expect(negativeNet(makeSnapshot(withMonth(0, 3000)))?.detail).toContain('no income');
  });

  it('does not fire when income covers spending', () => {
    expect(negativeNet(makeSnapshot())).toBeNull();
  });
});

describe('R4 low savings rate', () => {
  it('fires below 10% of income kept', () => {
    expect(lowSavingsRate(makeSnapshot(withMonth(20000, 19000)))?.detail).toContain('5%');
  });

  it('does not fire for a healthy rate, or when R3 already covers a deficit', () => {
    expect(lowSavingsRate(makeSnapshot())).toBeNull();
    expect(lowSavingsRate(makeSnapshot(withMonth(10000, 12000)))).toBeNull();
  });
});

describe('R5 goal off pace', () => {
  it('fires when the required monthly amount exceeds the pace so far', () => {
    // 50,000 left over ~6 months ≈ 8,400/month; 10,000 saved over ~4 months ≈ 2,500/month.
    const f = goalOffPace(makeSnapshot({ activeGoals: [goal()] }))!;
    expect(f.id).toBe('goal-off-pace:goal-1');
    expect(f.detail).toMatch(/need about KES 8,\d{3} a month; so far you've averaged KES 2,\d{3}/);
  });

  it('flags a goal whose deadline has passed', () => {
    const f = goalOffPace(makeSnapshot({ activeGoals: [goal({ deadline: '2026-09-01' })] }));
    expect(f?.severity).toBe('critical');
  });

  it('does not fire for a goal on pace or without a deadline', () => {
    const onPace = goal({ currentAmount: 50000 });
    expect(goalOffPace(makeSnapshot({ activeGoals: [onPace] }))).toBeNull();
    expect(goalOffPace(makeSnapshot({ activeGoals: [goal({ deadline: null })] }))).toBeNull();
  });
});

describe('R6 budget breach', () => {
  it('fires when spending exceeds a budget', () => {
    const f = budgetBreach(makeSnapshot({ budgets: [budget(3000, 4500)] }))!;
    expect(f.detail).toContain('KES 1,500 over');
  });

  it('does not fire within budget', () => {
    expect(budgetBreach(makeSnapshot({ budgets: [budget(5000, 4500)] }))).toBeNull();
  });
});

describe('R7 uncategorised coverage', () => {
  it('fires when over 30% of spending has no category', () => {
    const s = makeSnapshot({
      spendingThisMonth: spending('2026-10', [[null, 5000], ['food', 5000]]),
    });
    expect(uncategorisedCoverage(s)?.detail).toContain('50%');
  });

  it('does not fire when nearly everything is categorised', () => {
    expect(uncategorisedCoverage(makeSnapshot())).toBeNull();
  });
});

describe('R8 positive streak', () => {
  it('reports spending down between the last two complete months', () => {
    const s = makeSnapshot({
      cashflow: [
        { month: '2026-08', income: 20000, expense: 15000, net: 5000 },
        { month: '2026-09', income: 20000, expense: 12000, net: 8000 },
      ],
    });
    expect(positiveStreak(s)?.id).toBe('positive-spending-down');
    expect(positiveStreak(s)?.detail).toContain('20% less');
  });

  it('falls back to a healthy savings rate', () => {
    expect(positiveStreak(makeSnapshot())?.id).toBe('positive-savings-rate');
  });

  it('returns null when nothing is going well', () => {
    expect(positiveStreak(makeSnapshot(withMonth(10000, 12000)))).toBeNull();
  });
});

describe('R9 no data', () => {
  it('fires below five transactions and suppresses all other analysis', () => {
    const s = makeSnapshot({ ...withMonth(0, 3000), transactionCount: 2 });
    expect(noData(s)?.detail).toContain('2 transactions');
    expect(runInsights(s).map((f) => f.id)).toEqual(['no-data']);
  });

  it('does not fire with enough data', () => {
    expect(noData(makeSnapshot())).toBeNull();
  });
});

describe('runInsights', () => {
  it('ranks findings by score, most important first', () => {
    const s = makeSnapshot({
      ...withMonth(8000, 12000),
      budgets: [budget(3000, 4500)],
      activeGoals: [goal()],
    });
    const ids = runInsights(s).map((f) => f.id);
    expect(ids[0]).toBe('negative-net');
    expect(ids).toContain('budget-breach:budget-1');
    expect(ids).toContain('goal-off-pace:goal-1');
  });
});
