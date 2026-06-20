import { query, type Queryable } from '../../db/database.js';
import type { WalletRecord } from './wallets.types.js';

/**
 * Wallet data access — the only place that runs SQL against the `wallets` table.
 *
 * Ownership is baked into every query: each statement filters by `user_id`, so
 * one user can never read or mutate another user's wallet even if they guess an
 * id. This is the backend's last line of defence and must never be skipped.
 */

export interface InsertWalletData {
  userId: string;
  name: string;
  type: string;
  currency: string;
  openingBalance: number;
}

export async function insertWallet(data: InsertWalletData): Promise<WalletRecord> {
  // current_balance starts equal to opening_balance ($5 reused).
  const { rows } = await query<WalletRecord>(
    `insert into wallets (user_id, name, type, currency, opening_balance, current_balance)
     values ($1, $2, $3, $4, $5, $5)
     returning *`,
    [data.userId, data.name, data.type, data.currency, data.openingBalance],
  );
  return rows[0]!;
}

export async function findByUser(
  userId: string,
  options: { includeInactive?: boolean } = {},
): Promise<WalletRecord[]> {
  const onlyActive = options.includeInactive ? '' : 'and is_active = true';
  const { rows } = await query<WalletRecord>(
    `select * from wallets
     where user_id = $1 ${onlyActive}
     order by created_at asc`,
    [userId],
  );
  return rows;
}

export async function findById(
  userId: string,
  walletId: string,
): Promise<WalletRecord | null> {
  const { rows } = await query<WalletRecord>(
    `select * from wallets where id = $1 and user_id = $2`,
    [walletId, userId],
  );
  return rows[0] ?? null;
}

export async function updateMetadata(
  userId: string,
  walletId: string,
  fields: { name?: string; type?: string },
): Promise<WalletRecord | null> {
  // Build the SET clause from a fixed allowlist of columns. Column names are
  // hard-coded (never user input); values are always parameterised.
  const sets: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  if (fields.name !== undefined) {
    sets.push(`name = $${i++}`);
    values.push(fields.name);
  }
  if (fields.type !== undefined) {
    sets.push(`type = $${i++}`);
    values.push(fields.type);
  }

  if (sets.length === 0) {
    return findById(userId, walletId);
  }

  sets.push(`updated_at = now()`);
  values.push(walletId, userId);

  const { rows } = await query<WalletRecord>(
    `update wallets set ${sets.join(', ')}
     where id = $${i++} and user_id = $${i}
     returning *`,
    values,
  );
  return rows[0] ?? null;
}

/**
 * Fetch a wallet and lock its row for the duration of the surrounding
 * transaction (SELECT ... FOR UPDATE). Any other transaction trying to touch
 * the same wallet waits until this one commits, preventing lost balance
 * updates under concurrency. Must be called inside `withTransaction`.
 */
export async function lockById(
  db: Queryable,
  userId: string,
  walletId: string,
): Promise<WalletRecord | null> {
  const { rows } = await db.query<WalletRecord>(
    `select * from wallets where id = $1 and user_id = $2 for update`,
    [walletId, userId],
  );
  return rows[0] ?? null;
}

/**
 * Apply a signed delta to a wallet's current balance (positive for money in,
 * negative for money out). Runs on the provided executor so it joins the
 * caller's transaction.
 */
export async function adjustBalance(
  db: Queryable,
  userId: string,
  walletId: string,
  delta: number,
): Promise<WalletRecord> {
  const { rows } = await db.query<WalletRecord>(
    `update wallets
     set current_balance = current_balance + $3, updated_at = now()
     where id = $1 and user_id = $2
     returning *`,
    [walletId, userId, delta],
  );
  return rows[0]!;
}

export async function deactivate(
  userId: string,
  walletId: string,
): Promise<WalletRecord | null> {
  const { rows } = await query<WalletRecord>(
    `update wallets set is_active = false, updated_at = now()
     where id = $1 and user_id = $2 and is_active = true
     returning *`,
    [walletId, userId],
  );
  return rows[0] ?? null;
}
