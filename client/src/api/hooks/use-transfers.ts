import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../client';
import type { TransferResponse } from '../types';

/**
 * Creating a transfer moves money between two wallets and writes two transaction
 * legs, so it invalidates wallets, transactions and the dashboard.
 */

export interface CreateTransferInput {
  fromWalletId: string;
  toWalletId: string;
  amount: number;
  description?: string;
  transferDate?: string;
}

export function useCreateTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateTransferInput) =>
      api.post<TransferResponse>('/api/transfers', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wallets'] });
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
