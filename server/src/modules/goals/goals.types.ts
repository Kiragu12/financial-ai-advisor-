/**
 * Savings goal shapes.
 *
 * A goal is a target the user saves towards (e.g. "Laptop — 80,000 KES").
 * `current_amount` grows as the user records contributions. Money amounts arrive
 * from pg as strings (numeric); `deadline` and `contribution_date` arrive as
 * 'YYYY-MM-DD' strings (see the date type parser in database.ts).
 */

export type GoalStatus = 'active' | 'completed' | 'paused' | 'cancelled';

export interface GoalRecord {
  id: string;
  user_id: string;
  name: string;
  target_amount: string;
  current_amount: string;
  deadline: string | null;
  status: GoalStatus;
  created_at: Date;
  updated_at: Date;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string | null;
  status: GoalStatus;
  /** Convenience for the UI: how far along the goal is, 0–100 (capped). */
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContributionRecord {
  id: string;
  user_id: string;
  goal_id: string;
  wallet_id: string | null;
  amount: string;
  contribution_date: string;
  note: string | null;
  created_at: Date;
}

export interface Contribution {
  id: string;
  goalId: string;
  walletId: string | null;
  amount: number;
  contributionDate: string;
  note: string | null;
  createdAt: string;
}

export function toGoal(record: GoalRecord): Goal {
  const target = Number(record.target_amount);
  const current = Number(record.current_amount);
  // Guard against divide-by-zero (target is always > 0 by DB constraint, but be
  // defensive) and never report more than 100%.
  const progress = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

  return {
    id: record.id,
    name: record.name,
    targetAmount: target,
    currentAmount: current,
    deadline: record.deadline,
    status: record.status,
    progress,
    createdAt: record.created_at.toISOString(),
    updatedAt: record.updated_at.toISOString(),
  };
}

export function toContribution(record: ContributionRecord): Contribution {
  return {
    id: record.id,
    goalId: record.goal_id,
    walletId: record.wallet_id,
    amount: Number(record.amount),
    contributionDate: record.contribution_date,
    note: record.note,
    createdAt: record.created_at.toISOString(),
  };
}
