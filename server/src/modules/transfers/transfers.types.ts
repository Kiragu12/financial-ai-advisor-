/**
 * Transfer shapes.
 *
 * A transfer is the metadata for moving money between two of a user's wallets.
 * The actual balance movements live as two linked transaction rows
 * (transfer_out on the source, transfer_in on the destination). `amount`
 * arrives from pg as a string; `transfer_date` as a 'YYYY-MM-DD' string.
 */

export interface TransferRecord {
  id: string;
  user_id: string;
  from_wallet_id: string;
  to_wallet_id: string;
  amount: string;
  description: string | null;
  transfer_date: string;
  created_at: Date;
  updated_at: Date;
}

export interface Transfer {
  id: string;
  fromWalletId: string;
  toWalletId: string;
  amount: number;
  description: string | null;
  transferDate: string;
  createdAt: string;
  updatedAt: string;
}

export function toTransfer(record: TransferRecord): Transfer {
  return {
    id: record.id,
    fromWalletId: record.from_wallet_id,
    toWalletId: record.to_wallet_id,
    amount: Number(record.amount),
    description: record.description,
    transferDate: record.transfer_date,
    createdAt: record.created_at.toISOString(),
    updatedAt: record.updated_at.toISOString(),
  };
}
