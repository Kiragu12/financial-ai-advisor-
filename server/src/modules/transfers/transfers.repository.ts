import { query, type Queryable } from '../../db/database.js';
import type { TransferRecord } from './transfers.types.js';

/**
 * Transfer data access — SQL against the `transfers` table only. The paired
 * transaction rows are written via the transactions repository, keeping each
 * table's SQL in its own module.
 */

export interface InsertTransferData {
  userId: string;
  fromWalletId: string;
  toWalletId: string;
  amount: number;
  description: string | null;
  transferDate: string;
}

export async function insert(
  db: Queryable,
  data: InsertTransferData,
): Promise<TransferRecord> {
  const { rows } = await db.query<TransferRecord>(
    `insert into transfers
       (user_id, from_wallet_id, to_wallet_id, amount, description, transfer_date)
     values ($1, $2, $3, $4, $5, $6)
     returning *`,
    [
      data.userId,
      data.fromWalletId,
      data.toWalletId,
      data.amount,
      data.description,
      data.transferDate,
    ],
  );
  return rows[0]!;
}

export async function findByUser(userId: string): Promise<TransferRecord[]> {
  const { rows } = await query<TransferRecord>(
    `select * from transfers
     where user_id = $1
     order by transfer_date desc, created_at desc`,
    [userId],
  );
  return rows;
}

export async function findById(
  userId: string,
  transferId: string,
): Promise<TransferRecord | null> {
  const { rows } = await query<TransferRecord>(
    `select * from transfers where id = $1 and user_id = $2`,
    [transferId, userId],
  );
  return rows[0] ?? null;
}
