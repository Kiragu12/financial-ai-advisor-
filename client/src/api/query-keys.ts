/**
 * Centralised TanStack Query keys.
 *
 * Every query and invalidation routes through here. A typo at an invalidation
 * site used to silently fail (`['dashbaord']` won't match anything); now both
 * sides reference the same constant, so refactors stay safe.
 *
 * Keys are exposed as readonly tuples so TanStack's internal hashing stays
 * stable and TS can narrow the literal types at call sites.
 */

import type { CategoryType, GoalStatus, TransactionType } from './types';

export interface TransactionFiltersKey {
  walletId?: string;
  categoryId?: string;
  type?: TransactionType;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}

export const queryKeys = {
  me: ['me'] as const,

  wallets: {
    all: ['wallets'] as const,
  },

  categories: {
    all: ['categories'] as const,
    list: (type?: CategoryType) => ['categories', type ?? 'all'] as const,
  },

  transactions: {
    all: ['transactions'] as const,
    list: (filters: TransactionFiltersKey) => ['transactions', filters] as const,
  },

  goals: {
    all: ['goals'] as const,
    list: (status?: GoalStatus) => ['goals', status ?? 'all'] as const,
  },

  dashboard: {
    all: ['dashboard'] as const,
    summary: ['dashboard', 'summary'] as const,
    spending: ['dashboard', 'spending'] as const,
    cashflow: (months: number) => ['dashboard', 'cashflow', months] as const,
  },

  advisor: {
    all: ['advisor'] as const,
    conversations: ['advisor', 'conversations'] as const,
    conversation: (id: string | null) => ['advisor', 'conversation', id] as const,
  },
} as const;
