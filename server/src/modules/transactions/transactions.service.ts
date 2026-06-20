import { withTransaction } from '../../db/database.js';
import { AppError } from '../../shared/app-error.js';
import * as walletRepo from '../wallets/wallets.repository.js';
import * as categoryRepo from '../categories/categories.repository.js';
import * as txnRepo from './transactions.repository.js';
import {
  toTransaction,
  type Transaction,
  type TransactionType,
} from './transactions.types.js';
import type { CreateTransactionInput, ListTransactionsQuery } from './transactions.schemas.js';

/**
 * Transaction business rules. Every balance-affecting operation runs inside a
 * single DB transaction with the wallet row locked, so the transaction row and
 * the wallet balance always move together — never one without the other.
 */

/** How a transaction type moves a wallet balance: +1 = money in, -1 = money out. */
function balanceDirection(type: TransactionType): 1 | -1 {
  return type === 'income' || type === 'transfer_in' ? 1 : -1;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function recordTransaction(
  userId: string,
  input: CreateTransactionInput,
): Promise<Transaction> {
  const transactionDate = input.transactionDate ?? today();

  return withTransaction(async (db) => {
    // Lock the wallet so a concurrent transaction can't compute its new
    // balance from a stale value.
    const wallet = await walletRepo.lockById(db, userId, input.walletId);
    if (!wallet) {
      throw AppError.notFound('Wallet not found.');
    }
    if (!wallet.is_active) {
      throw AppError.badRequest('Cannot add transactions to an inactive wallet.');
    }

    // If a category was given, it must be usable by this user and match the
    // transaction's direction (an expense needs an expense category).
    if (input.categoryId) {
      const category = await categoryRepo.findUsableById(userId, input.categoryId, db);
      if (!category) {
        throw AppError.notFound('Category not found.');
      }
      if (category.type !== input.type) {
        throw AppError.badRequest(
          `Category type "${category.type}" does not match a "${input.type}" transaction.`,
        );
      }
    }

    const delta = balanceDirection(input.type) * input.amount;
    const newBalance = Number(wallet.current_balance) + delta;
    if (newBalance < 0) {
      throw AppError.badRequest('Insufficient funds in this wallet.');
    }

    const record = await txnRepo.insert(db, {
      userId,
      walletId: input.walletId,
      categoryId: input.categoryId ?? null,
      type: input.type,
      amount: input.amount,
      description: input.description ?? null,
      transactionDate,
    });
    await walletRepo.adjustBalance(db, userId, input.walletId, delta);

    return toTransaction(record);
  });
}

export async function listTransactions(
  userId: string,
  filters: ListTransactionsQuery,
): Promise<Transaction[]> {
  const records = await txnRepo.findByUser(userId, filters);
  return records.map(toTransaction);
}

export async function getTransaction(
  userId: string,
  transactionId: string,
): Promise<Transaction> {
  const record = await txnRepo.findById(userId, transactionId);
  if (!record) {
    throw AppError.notFound('Transaction not found.');
  }
  return toTransaction(record);
}

/**
 * Soft-delete a transaction and undo its effect on the wallet balance, both in
 * one DB transaction. Transfer-linked entries can't be deleted here — they must
 * be reversed through the transfers feature so both sides stay consistent.
 */
export async function deleteTransaction(
  userId: string,
  transactionId: string,
): Promise<Transaction> {
  return withTransaction(async (db) => {
    const record = await txnRepo.findById(userId, transactionId, db);
    if (!record) {
      throw AppError.notFound('Transaction not found.');
    }
    if (record.transfer_id !== null) {
      throw AppError.badRequest(
        'This entry is part of a transfer and cannot be deleted directly.',
      );
    }

    const wallet = await walletRepo.lockById(db, userId, record.wallet_id);
    if (!wallet) {
      throw AppError.notFound('Wallet not found.');
    }

    // Undo the original movement: reverse its direction.
    const reverseDelta = -balanceDirection(record.type) * Number(record.amount);
    const newBalance = Number(wallet.current_balance) + reverseDelta;
    if (newBalance < 0) {
      throw AppError.badRequest(
        'Reversing this transaction would make the wallet balance negative.',
      );
    }

    const deleted = await txnRepo.softDelete(db, userId, transactionId);
    await walletRepo.adjustBalance(db, userId, record.wallet_id, reverseDelta);

    return toTransaction(deleted!);
  });
}
