import { pool, query, type Queryable } from '../../db/database.js';
import type { TransactionRecord } from './transactions.types.js';
import type { ListTransactionsQuery } from './transactions.schemas.js';

/**
 * Transaction data access. Reads exclude soft-deleted rows (deleted_at is null).
 * Writes that participate in a balance change accept a Queryable so they run on
 * the service's transaction client.
 */

export interface InsertTransactionData {
  userId: string;
  walletId: string;
  categoryId: string | null;
  type: 'income' | 'expense';
  amount: number;
  description: string | null;
  transactionDate: string;
}

export async function insert(
  db: Queryable,
  data: InsertTransactionData,
): Promise<TransactionRecord> {
  const { rows } = await db.query<TransactionRecord>(
    `insert into transactions
       (user_id, wallet_id, category_id, type, amount, description, transaction_date)
     values ($1, $2, $3, $4, $5, $6, $7)
     returning *`,
    [
      data.userId,
      data.walletId,
      data.categoryId,
      data.type,
      data.amount,
      data.description,
      data.transactionDate,
    ],
  );
  return rows[0]!;
}

export interface InsertTransferEntryData {
  userId: string;
  walletId: string;
  transferId: string;
  type: 'transfer_in' | 'transfer_out';
  amount: number;
  description: string | null;
  transactionDate: string;
}

/**
 * Insert one leg of a transfer (the debit or the credit). Always carries a
 * transfer_id linking it back to the transfers row, and never has a category.
 * Called twice — once per wallet — inside the transfer's DB transaction.
 */
export async function insertTransferEntry(
  db: Queryable,
  data: InsertTransferEntryData,
): Promise<TransactionRecord> {
  const { rows } = await db.query<TransactionRecord>(
    `insert into transactions
       (user_id, wallet_id, category_id, type, amount, description, transaction_date, transfer_id)
     values ($1, $2, null, $3, $4, $5, $6, $7)
     returning *`,
    [
      data.userId,
      data.walletId,
      data.type,
      data.amount,
      data.description,
      data.transactionDate,
      data.transferId,
    ],
  );
  return rows[0]!;
}

export async function findById(
  userId: string,
  transactionId: string,
  db: Queryable = pool,
): Promise<TransactionRecord | null> {
  const { rows } = await db.query<TransactionRecord>(
    `select * from transactions
     where id = $1 and user_id = $2 and deleted_at is null`,
    [transactionId, userId],
  );
  return rows[0] ?? null;
}

export async function findByUser(
  userId: string,
  filters: ListTransactionsQuery,
): Promise<TransactionRecord[]> {
  // Build the WHERE clause from a fixed set of optional filters. Column names
  // are hard-coded; every value is parameterised.
  const conditions = ['user_id = $1', 'deleted_at is null'];
  const values: unknown[] = [userId];
  let i = 2;

  if (filters.walletId) {
    conditions.push(`wallet_id = $${i++}`);
    values.push(filters.walletId);
  }
  if (filters.categoryId) {
    conditions.push(`category_id = $${i++}`);
    values.push(filters.categoryId);
  }
  if (filters.type) {
    conditions.push(`type = $${i++}`);
    values.push(filters.type);
  }
  if (filters.from) {
    conditions.push(`transaction_date >= $${i++}`);
    values.push(filters.from);
  }
  if (filters.to) {
    conditions.push(`transaction_date <= $${i++}`);
    values.push(filters.to);
  }

  const limitPlaceholder = `$${i++}`;
  const offsetPlaceholder = `$${i}`;
  values.push(filters.limit, filters.offset);

  const { rows } = await query<TransactionRecord>(
    `select * from transactions
     where ${conditions.join(' and ')}
     order by transaction_date desc, created_at desc
     limit ${limitPlaceholder} offset ${offsetPlaceholder}`,
    values,
  );
  return rows;
}

export async function softDelete(
  db: Queryable,
  userId: string,
  transactionId: string,
): Promise<TransactionRecord | null> {
  const { rows } = await db.query<TransactionRecord>(
    `update transactions set deleted_at = now(), updated_at = now()
     where id = $1 and user_id = $2 and deleted_at is null
     returning *`,
    [transactionId, userId],
  );
  return rows[0] ?? null;
}
