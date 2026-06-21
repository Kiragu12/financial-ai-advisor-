import { query, type Queryable } from '../../db/database.js';
import type { GoalRecord, GoalStatus, ContributionRecord } from './goals.types.js';

/**
 * Savings goal data access — the only place that runs SQL against the
 * `savings_goals` and `goal_contributions` tables. Every query is scoped by
 * `user_id`, so one user can never read or mutate another user's goal even if
 * they guess an id.
 */

export interface InsertGoalData {
  userId: string;
  name: string;
  targetAmount: number;
  deadline: string | null;
}

export async function insertGoal(data: InsertGoalData): Promise<GoalRecord> {
  const { rows } = await query<GoalRecord>(
    `insert into savings_goals (user_id, name, target_amount, deadline)
     values ($1, $2, $3, $4)
     returning *`,
    [data.userId, data.name, data.targetAmount, data.deadline],
  );
  return rows[0]!;
}

export async function findByUser(
  userId: string,
  options: { status?: GoalStatus } = {},
): Promise<GoalRecord[]> {
  const conditions = ['user_id = $1'];
  const values: unknown[] = [userId];

  if (options.status) {
    conditions.push(`status = $2`);
    values.push(options.status);
  }

  const { rows } = await query<GoalRecord>(
    `select * from savings_goals
     where ${conditions.join(' and ')}
     order by created_at desc`,
    values,
  );
  return rows;
}

export async function findById(
  userId: string,
  goalId: string,
): Promise<GoalRecord | null> {
  const { rows } = await query<GoalRecord>(
    `select * from savings_goals where id = $1 and user_id = $2`,
    [goalId, userId],
  );
  return rows[0] ?? null;
}

/**
 * Fetch a goal and lock its row for the rest of the surrounding transaction
 * (SELECT ... FOR UPDATE). Used when recording a contribution so two
 * simultaneous contributions can't both read a stale current_amount and lose an
 * update. Must be called inside `withTransaction`.
 */
export async function lockById(
  db: Queryable,
  userId: string,
  goalId: string,
): Promise<GoalRecord | null> {
  const { rows } = await db.query<GoalRecord>(
    `select * from savings_goals where id = $1 and user_id = $2 for update`,
    [goalId, userId],
  );
  return rows[0] ?? null;
}

export async function updateMetadata(
  userId: string,
  goalId: string,
  fields: {
    name?: string;
    targetAmount?: number;
    deadline?: string | null;
    status?: GoalStatus;
  },
): Promise<GoalRecord | null> {
  // SET clause built from a fixed allowlist of columns. Column names are
  // hard-coded (never user input); values are always parameterised.
  const sets: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  if (fields.name !== undefined) {
    sets.push(`name = $${i++}`);
    values.push(fields.name);
  }
  if (fields.targetAmount !== undefined) {
    sets.push(`target_amount = $${i++}`);
    values.push(fields.targetAmount);
  }
  if (fields.deadline !== undefined) {
    sets.push(`deadline = $${i++}`);
    values.push(fields.deadline);
  }
  if (fields.status !== undefined) {
    sets.push(`status = $${i++}`);
    values.push(fields.status);
  }

  if (sets.length === 0) {
    return findById(userId, goalId);
  }

  sets.push(`updated_at = now()`);
  values.push(goalId, userId);

  const { rows } = await query<GoalRecord>(
    `update savings_goals set ${sets.join(', ')}
     where id = $${i++} and user_id = $${i}
     returning *`,
    values,
  );
  return rows[0] ?? null;
}

/**
 * Add a signed delta to a goal's current_amount and set its status in the same
 * write. Runs on the provided executor so it joins the caller's transaction.
 */
export async function applyContribution(
  db: Queryable,
  userId: string,
  goalId: string,
  delta: number,
  status: GoalStatus,
): Promise<GoalRecord> {
  const { rows } = await db.query<GoalRecord>(
    `update savings_goals
     set current_amount = current_amount + $3, status = $4, updated_at = now()
     where id = $1 and user_id = $2
     returning *`,
    [goalId, userId, delta, status],
  );
  return rows[0]!;
}

export interface InsertContributionData {
  userId: string;
  goalId: string;
  walletId: string | null;
  amount: number;
  contributionDate: string;
  note: string | null;
}

export async function insertContribution(
  db: Queryable,
  data: InsertContributionData,
): Promise<ContributionRecord> {
  const { rows } = await db.query<ContributionRecord>(
    `insert into goal_contributions
       (user_id, goal_id, wallet_id, amount, contribution_date, note)
     values ($1, $2, $3, $4, $5, $6)
     returning *`,
    [
      data.userId,
      data.goalId,
      data.walletId,
      data.amount,
      data.contributionDate,
      data.note,
    ],
  );
  return rows[0]!;
}

export async function findContributions(
  userId: string,
  goalId: string,
): Promise<ContributionRecord[]> {
  const { rows } = await query<ContributionRecord>(
    `select * from goal_contributions
     where user_id = $1 and goal_id = $2
     order by contribution_date desc, created_at desc`,
    [userId, goalId],
  );
  return rows;
}
