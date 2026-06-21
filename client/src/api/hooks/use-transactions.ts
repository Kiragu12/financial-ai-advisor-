import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../client';
import type {
  Transaction,
  TransactionResponse,
  TransactionsResponse,
} from '../types';

/**
 * Transaction data hooks. A transaction moves a wallet balance, so its mutations
 * invalidate wallets and the dashboard alongside the transaction list.
 */

export interface TransactionFilters {
  walletId?: string;
  categoryId?: string;
  type?: 'income' | 'expense';
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}

function toQueryString(filters: TransactionFilters): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== '') params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export function useTransactions(filters: TransactionFilters = {}) {
  return useQuery({
    queryKey: ['transactions', filters] as const,
    queryFn: async (): Promise<Transaction[]> => {
      const { transactions } = await api.get<TransactionsResponse>(
        `/api/transactions${toQueryString(filters)}`,
      );
      return transactions;
    },
  });
}

export interface CreateTransactionInput {
  walletId: string;
  type: 'income' | 'expense';
  amount: number;
  categoryId?: string;
  description?: string;
  transactionDate?: string;
}

function invalidateMoneyViews(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ['transactions'] });
  qc.invalidateQueries({ queryKey: ['wallets'] });
  qc.invalidateQueries({ queryKey: ['dashboard'] });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateTransactionInput) =>
      api.post<TransactionResponse>('/api/transactions', body),
    onSuccess: () => invalidateMoneyViews(qc),
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (transactionId: string) =>
      api.delete<TransactionResponse>(`/api/transactions/${transactionId}`),
    onSuccess: () => invalidateMoneyViews(qc),
  });
}
