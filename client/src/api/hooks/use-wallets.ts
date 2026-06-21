import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../client';
import type { Wallet, WalletResponse, WalletsResponse, WalletType } from '../types';

/**
 * Wallet data hooks. Mutations invalidate the dashboard too, since wallet
 * balances feed the aggregate figures there.
 */

export const WALLETS_KEY = ['wallets'] as const;

export function useWallets() {
  return useQuery({
    queryKey: WALLETS_KEY,
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

export function useCreateWallet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateWalletInput) =>
      api.post<WalletResponse>('/api/wallets', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: WALLETS_KEY });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteWallet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (walletId: string) =>
      api.delete<WalletResponse>(`/api/wallets/${walletId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: WALLETS_KEY });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
