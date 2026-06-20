import { withTransaction } from '../../db/database.js';
import { AppError } from '../../shared/app-error.js';
import * as walletRepo from '../wallets/wallets.repository.js';
import * as txnRepo from '../transactions/transactions.repository.js';
import * as transferRepo from './transfers.repository.js';
import { toTransfer, type Transfer } from './transfers.types.js';
import type { CreateTransferInput } from './transfers.schemas.js';
import type { WalletRecord } from '../wallets/wallets.types.js';

/**
 * Transfer business rules.
 *
 * A transfer is five writes that must all succeed together: the transfer row,
 * a transfer_out transaction, a transfer_in transaction, a debit on the source
 * balance and a credit on the destination balance. They run in one DB
 * transaction so the system can never end up with money debited but not
 * credited (or vice versa).
 */

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function createTransfer(
  userId: string,
  input: CreateTransferInput,
): Promise<Transfer> {
  const transferDate = input.transferDate ?? today();

  return withTransaction(async (db) => {
    // Lock BOTH wallets, always in the same (sorted) order regardless of
    // transfer direction. Two simultaneous transfers between the same pair of
    // wallets therefore acquire locks in the same sequence and cannot deadlock.
    // Each wallet is locked exactly once, then read back by role below.
    const locked = new Map<string, WalletRecord | null>();
    for (const walletId of [input.fromWalletId, input.toWalletId].sort()) {
      locked.set(walletId, await walletRepo.lockById(db, userId, walletId));
    }
    const fromWallet = locked.get(input.fromWalletId) ?? null;
    const toWallet = locked.get(input.toWalletId) ?? null;

    if (!fromWallet) {
      throw AppError.notFound('Source wallet not found.');
    }
    if (!toWallet) {
      throw AppError.notFound('Destination wallet not found.');
    }
    if (!fromWallet.is_active || !toWallet.is_active) {
      throw AppError.badRequest('Cannot transfer to or from an inactive wallet.');
    }
    if (Number(fromWallet.current_balance) < input.amount) {
      throw AppError.badRequest('Insufficient funds in the source wallet.');
    }

    // 1. The transfer record (the audit/metadata row).
    const transfer = await transferRepo.insert(db, {
      userId,
      fromWalletId: input.fromWalletId,
      toWalletId: input.toWalletId,
      amount: input.amount,
      description: input.description ?? null,
      transferDate,
    });

    // 2. The two linked transaction legs, both pointing at the transfer.
    await txnRepo.insertTransferEntry(db, {
      userId,
      walletId: input.fromWalletId,
      transferId: transfer.id,
      type: 'transfer_out',
      amount: input.amount,
      description: input.description ?? null,
      transactionDate: transferDate,
    });
    await txnRepo.insertTransferEntry(db, {
      userId,
      walletId: input.toWalletId,
      transferId: transfer.id,
      type: 'transfer_in',
      amount: input.amount,
      description: input.description ?? null,
      transactionDate: transferDate,
    });

    // 3. Move the money: debit source, credit destination.
    await walletRepo.adjustBalance(db, userId, input.fromWalletId, -input.amount);
    await walletRepo.adjustBalance(db, userId, input.toWalletId, input.amount);

    return toTransfer(transfer);
  });
}

export async function listTransfers(userId: string): Promise<Transfer[]> {
  const records = await transferRepo.findByUser(userId);
  return records.map(toTransfer);
}

export async function getTransfer(
  userId: string,
  transferId: string,
): Promise<Transfer> {
  const record = await transferRepo.findById(userId, transferId);
  if (!record) {
    throw AppError.notFound('Transfer not found.');
  }
  return toTransfer(record);
}
