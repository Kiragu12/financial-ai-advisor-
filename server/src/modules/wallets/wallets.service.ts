import { AppError } from '../../shared/app-error.js';
import * as walletRepo from './wallets.repository.js';
import { toWallet, type Wallet } from './wallets.types.js';
import type { CreateWalletInput, UpdateWalletInput } from './wallets.schemas.js';

/**
 * Wallet business rules. Knows nothing about HTTP. Every method takes the
 * acting user's id so the repository can enforce ownership, and turns "row not
 * found for this user" into a clean 404.
 */

export async function createWallet(
  userId: string,
  input: CreateWalletInput,
): Promise<Wallet> {
  const record = await walletRepo.insertWallet({
    userId,
    name: input.name,
    type: input.type,
    currency: input.currency,
    openingBalance: input.openingBalance,
  });
  return toWallet(record);
}

export async function listWallets(
  userId: string,
  includeInactive = false,
): Promise<Wallet[]> {
  const records = await walletRepo.findByUser(userId, { includeInactive });
  return records.map(toWallet);
}

export async function getWallet(userId: string, walletId: string): Promise<Wallet> {
  const record = await walletRepo.findById(userId, walletId);
  if (!record) {
    throw AppError.notFound('Wallet not found.');
  }
  return toWallet(record);
}

export async function updateWallet(
  userId: string,
  walletId: string,
  input: UpdateWalletInput,
): Promise<Wallet> {
  const updated = await walletRepo.updateMetadata(userId, walletId, input);
  if (!updated) {
    throw AppError.notFound('Wallet not found.');
  }
  return toWallet(updated);
}

/**
 * Deactivate (soft delete) a wallet. We never hard-delete because transactions
 * reference it and financial history must be preserved. Idempotent: calling it
 * on an already-inactive wallet returns the wallet rather than erroring.
 */
export async function deactivateWallet(
  userId: string,
  walletId: string,
): Promise<Wallet> {
  const deactivated = await walletRepo.deactivate(userId, walletId);
  if (deactivated) {
    return toWallet(deactivated);
  }

  // No row updated: either it doesn't exist, or it was already inactive.
  const existing = await walletRepo.findById(userId, walletId);
  if (!existing) {
    throw AppError.notFound('Wallet not found.');
  }
  return toWallet(existing);
}
