/**
 * Transaction shapes.
 *
 * The DB type column has four values: income / expense are created directly by
 * users; transfer_in / transfer_out are created only by the transfers feature
 * (Sprint 5). `amount` arrives from pg as a string (numeric) and
 * `transaction_date` as a 'YYYY-MM-DD' string (see the date type parser).
 */

export type TransactionType = 'income' | 'expense' | 'transfer_in' | 'transfer_out';

export interface TransactionRecord {
  id: string;
  user_id: string;
  wallet_id: string;
  category_id: string | null;
  type: TransactionType;
  amount: string;
  description: string | null;
  transaction_date: string;
  transfer_id: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface Transaction {
  id: string;
  walletId: string;
  categoryId: string | null;
  type: TransactionType;
  amount: number;
  description: string | null;
  transactionDate: string;
  transferId: string | null;
  createdAt: string;
  updatedAt: string;
}

export function toTransaction(record: TransactionRecord): Transaction {
  return {
    id: record.id,
    walletId: record.wallet_id,
    categoryId: record.category_id,
    type: record.type,
    amount: Number(record.amount),
    description: record.description,
    transactionDate: record.transaction_date,
    transferId: record.transfer_id,
    createdAt: record.created_at.toISOString(),
    updatedAt: record.updated_at.toISOString(),
  };
}
