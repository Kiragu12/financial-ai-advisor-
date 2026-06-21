import { withTransaction } from '../../db/database.js';
import { AppError } from '../../shared/app-error.js';
import * as walletRepo from '../wallets/wallets.repository.js';
import * as txnRepo from '../transactions/transactions.repository.js';
import * as goalRepo from './goals.repository.js';
import {
  toGoal,
  toContribution,
  type Goal,
  type GoalStatus,
  type Contribution,
} from './goals.types.js';
import type {
  CreateGoalInput,
  UpdateGoalInput,
  CreateContributionInput,
} from './goals.schemas.js';

/**
 * Savings goal business rules.
 *
 * The interesting operation is `contribute`: when a contribution is funded from
 * a wallet, the money physically leaves that wallet. To keep wallet balances
 * trustworthy (every balance change has a matching transaction row), a
 * wallet-funded contribution also writes an `expense` transaction — all inside
 * one DB transaction so the goal, the wallet balance, the transaction and the
 * contribution record can never drift apart.
 */

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function createGoal(
  userId: string,
  input: CreateGoalInput,
): Promise<Goal> {
  const record = await goalRepo.insertGoal({
    userId,
    name: input.name,
    targetAmount: input.targetAmount,
    deadline: input.deadline ?? null,
  });
  return toGoal(record);
}

export async function listGoals(
  userId: string,
  status?: GoalStatus,
): Promise<Goal[]> {
  const records = await goalRepo.findByUser(userId, status ? { status } : {});
  return records.map(toGoal);
}

export async function getGoal(userId: string, goalId: string): Promise<Goal> {
  const record = await goalRepo.findById(userId, goalId);
  if (!record) {
    throw AppError.notFound('Goal not found.');
  }
  return toGoal(record);
}

export async function updateGoal(
  userId: string,
  goalId: string,
  input: UpdateGoalInput,
): Promise<Goal> {
  const existing = await goalRepo.findById(userId, goalId);
  if (!existing) {
    throw AppError.notFound('Goal not found.');
  }

  // A target below what's already saved would make progress exceed 100% and is
  // almost certainly a mistake — reject it with a clear message.
  if (
    input.targetAmount !== undefined &&
    input.targetAmount < Number(existing.current_amount)
  ) {
    throw AppError.badRequest(
      'Target amount cannot be less than the amount already saved.',
    );
  }

  const updated = await goalRepo.updateMetadata(userId, goalId, input);
  // updateMetadata only returns null if the row vanished between the two
  // queries; we already proved it exists, so treat that as not found.
  if (!updated) {
    throw AppError.notFound('Goal not found.');
  }
  return toGoal(updated);
}

export async function listContributions(
  userId: string,
  goalId: string,
): Promise<Contribution[]> {
  // Prove the goal exists/belongs to the user before listing its contributions.
  await getGoal(userId, goalId);
  const records = await goalRepo.findContributions(userId, goalId);
  return records.map(toContribution);
}

export interface ContributionResult {
  goal: Goal;
  contribution: Contribution;
}

export async function contribute(
  userId: string,
  goalId: string,
  input: CreateContributionInput,
): Promise<ContributionResult> {
  const contributionDate = input.contributionDate ?? today();

  return withTransaction(async (db) => {
    // Lock the goal first so a concurrent contribution can't read a stale
    // current_amount and overwrite our update.
    const goal = await goalRepo.lockById(db, userId, goalId);
    if (!goal) {
      throw AppError.notFound('Goal not found.');
    }
    if (goal.status !== 'active') {
      throw AppError.badRequest(
        `Cannot contribute to a ${goal.status} goal. Reactivate it first.`,
      );
    }

    // If the contribution is funded from a wallet, move real money: verify the
    // wallet, check funds, record an expense transaction, and debit the balance.
    if (input.walletId) {
      const wallet = await walletRepo.lockById(db, userId, input.walletId);
      if (!wallet) {
        throw AppError.notFound('Wallet not found.');
      }
      if (!wallet.is_active) {
        throw AppError.badRequest('Cannot contribute from an inactive wallet.');
      }
      if (Number(wallet.current_balance) < input.amount) {
        throw AppError.badRequest('Insufficient funds in the selected wallet.');
      }

      await txnRepo.insert(db, {
        userId,
        walletId: input.walletId,
        categoryId: null,
        type: 'expense',
        amount: input.amount,
        description: `Contribution to goal: ${goal.name}`,
        transactionDate: contributionDate,
      });
      await walletRepo.adjustBalance(db, userId, input.walletId, -input.amount);
    }

    // Record the contribution and roll it into the goal's running total. If the
    // total reaches the target, the goal is automatically completed.
    const contribution = await goalRepo.insertContribution(db, {
      userId,
      goalId,
      walletId: input.walletId ?? null,
      amount: input.amount,
      contributionDate,
      note: input.note ?? null,
    });

    const newAmount = Number(goal.current_amount) + input.amount;
    const newStatus: GoalStatus =
      newAmount >= Number(goal.target_amount) ? 'completed' : 'active';

    const updatedGoal = await goalRepo.applyContribution(
      db,
      userId,
      goalId,
      input.amount,
      newStatus,
    );

    return {
      goal: toGoal(updatedGoal),
      contribution: toContribution(contribution),
    };
  });
}
