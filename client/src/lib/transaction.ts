import type { TransactionType } from '../api/types';

export const TRANSACTION_TYPE_LABEL: Record<TransactionType, string> = {
  income: 'Income',
  expense: 'Expense',
  transfer_in: 'Transfer in',
  transfer_out: 'Transfer out',
};

export type TransactionDirection = 'income' | 'expense';

export function directionOf(type: TransactionType): TransactionDirection {
  return type === 'income' || type === 'transfer_in' ? 'income' : 'expense';
}
