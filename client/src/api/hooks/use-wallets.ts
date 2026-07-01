import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../client';
import { queryKeys } from '../query-keys';
import type { Wallet, WalletResponse, WalletsResponse, WalletType } from '../types';

/**
 * Wallet data hooks. Mutations invalidate the dashboard too, since wallet
 * balances feed the aggregate figures there.
 */

/** @deprecated Use queryKeys.wallets.all — kept for one release. */
export const WALLETS_KEY = queryKeys.wallets.all;

export function useWallets() {
  return useQuery({
    queryKey: queryKeys.wallets.all,
    queryFn: async (): Promise<Wallet[]> => {
      const { wallets } = await api.get<WalletsResponse>('/api/wallets');
      return wallets;
    },
  });
}

export interface CreateWalletInput {
  name: string;
  type: WalletType;
  currency?: string;
  openingBalance?: number;
}

export interface UpdateWalletInput {
  walletId: string;
  name?: string;
  type?: WalletType;
}

export function useCreateWallet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateWalletInput) =>
      api.post<WalletResponse>('/api/wallets', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.wallets.all });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
}

export function useUpdateWallet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ walletId, ...body }: UpdateWalletInput) =>
      api.patch<WalletResponse>(`/api/wallets/${walletId}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.wallets.all });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
}

export function useDeleteWallet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (walletId: string) =>
      api.delete<WalletResponse>(`/api/wallets/${walletId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.wallets.all });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
}
