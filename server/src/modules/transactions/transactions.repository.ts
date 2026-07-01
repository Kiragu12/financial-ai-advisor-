import { pool, query, type Queryable } from '../../db/database.js';
import type { TransactionRecord } from './transactions.types.js';
import type {
  ExportTransactionsQuery,
  ListTransactionsQuery,
} from './transactions.schemas.js';

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
  const { conditions, values, nextIndex } = buildFilterConditions(userId, filters);

  const limitPlaceholder = `$${nextIndex}`;
  const offsetPlaceholder = `$${nextIndex + 1}`;
  values.push(filters.limit, filters.offset);

  const { rows } = await query<TransactionRecord>(
    `select t.* from transactions t
     where ${conditions.join(' and ')}
     order by t.transaction_date desc, t.created_at desc
     limit ${limitPlaceholder} offset ${offsetPlaceholder}`,
    values,
  );
  return rows;
}

interface TransactionFilterInput {
  walletId?: string;
  categoryId?: string;
  type?: string;
  from?: string;
  to?: string;
}

function buildFilterConditions(userId: string, filters: TransactionFilterInput) {
  const conditions = ['t.user_id = $1', 't.deleted_at is null'];
  const values: unknown[] = [userId];
  let i = 2;

  if (filters.walletId) {
    conditions.push(`t.wallet_id = $${i++}`);
    values.push(filters.walletId);
  }
  if (filters.categoryId) {
    conditions.push(`t.category_id = $${i++}`);
    values.push(filters.categoryId);
  }
  if (filters.type) {
    conditions.push(`t.type = $${i++}`);
    values.push(filters.type);
  }
  if (filters.from) {
    conditions.push(`t.transaction_date >= $${i++}`);
    values.push(filters.from);
  }
  if (filters.to) {
    conditions.push(`t.transaction_date <= $${i++}`);
    values.push(filters.to);
  }

  return { conditions, values, nextIndex: i };
}

export interface ExportTransactionRow {
  id: string;
  transaction_date: string;
  type: TransactionRecord['type'];
  amount: string;
  description: string | null;
  wallet_name: string;
  category_name: string | null;
  created_at: Date;
}

export async function findExportRows(
  userId: string,
  filters: ExportTransactionsQuery,
): Promise<ExportTransactionRow[]> {
  const { conditions, values } = buildFilterConditions(userId, filters);
  const { rows } = await query<ExportTransactionRow>(
    `select
       t.id,
       t.transaction_date,
       t.type,
       t.amount,
       t.description,
       w.name as wallet_name,
       c.name as category_name,
       t.created_at
     from transactions t
     inner join wallets w on w.id = t.wallet_id and w.user_id = t.user_id
     left join categories c on c.id = t.category_id
     where ${conditions.join(' and ')}
     order by t.transaction_date desc, t.created_at desc`,
    values,
  );
  return rows;
}

export interface UpdateTransactionFields {
  walletId?: string;
  type?: 'income' | 'expense';
  amount?: number;
  categoryId?: string | null;
  description?: string | null;
  transactionDate?: string;
}

/**
 * Update an existing (non-deleted) transaction's columns. Column names come from
 * a fixed allowlist; every value is parameterised. Runs on the caller's
 * Queryable so it participates in the surrounding balance-adjustment transaction.
 */
export async function update(
  db: Queryable,
  userId: string,
  transactionId: string,
  fields: UpdateTransactionFields,
): Promise<TransactionRecord | null> {
  const sets: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  if (fields.walletId !== undefined) {
    sets.push(`wallet_id = $${i++}`);
    values.push(fields.walletId);
  }
  if (fields.type !== undefined) {
    sets.push(`type = $${i++}`);
    values.push(fields.type);
  }
  if (fields.amount !== undefined) {
    sets.push(`amount = $${i++}`);
    values.push(fields.amount);
  }
  if (fields.categoryId !== undefined) {
    sets.push(`category_id = $${i++}`);
    values.push(fields.categoryId);
  }
  if (fields.description !== undefined) {
    sets.push(`description = $${i++}`);
    values.push(fields.description);
  }
  if (fields.transactionDate !== undefined) {
    sets.push(`transaction_date = $${i++}`);
    values.push(fields.transactionDate);
  }

  sets.push(`updated_at = now()`);
  values.push(transactionId, userId);

  const { rows } = await db.query<TransactionRecord>(
    `update transactions set ${sets.join(', ')}
     where id = $${i++} and user_id = $${i} and deleted_at is null
     returning *`,
    values,
  );
  return rows[0] ?? null;
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
