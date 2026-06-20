/**
 * Wallet shapes.
 *
 * WalletRecord = raw `wallets` row. Note that `numeric` columns arrive from
 *                node-postgres as *strings* (to avoid float precision loss),
 *                so balances are typed as string here.
 * Wallet       = client-facing projection: camelCase, balances as numbers,
 *                timestamps as ISO strings.
 */

export type WalletType = 'cash' | 'mobile_money' | 'bank' | 'savings' | 'custom';

export interface WalletRecord {
  id: string;
  user_id: string;
  name: string;
  type: WalletType;
  currency: string;
  opening_balance: string;
  current_balance: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Wallet {
  id: string;
  name: string;
  type: WalletType;
  currency: string;
  openingBalance: number;
  currentBalance: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function toWallet(record: WalletRecord): Wallet {
  return {
    id: record.id,
    name: record.name,
    type: record.type,
    currency: record.currency,
    openingBalance: Number(record.opening_balance),
    currentBalance: Number(record.current_balance),
    isActive: record.is_active,
    createdAt: record.created_at.toISOString(),
    updatedAt: record.updated_at.toISOString(),
  };
}
