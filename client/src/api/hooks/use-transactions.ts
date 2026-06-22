import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../client';
import { queryKeys, type TransactionFiltersKey } from '../query-keys';
import type {
  Transaction,
  TransactionResponse,
  TransactionsResponse,
} from '../types';

/**
 * Transaction data hooks. A transaction moves a wallet balance, so its mutations
 * invalidate wallets and the dashboard alongside the transaction list.
 */

export type TransactionFilters = TransactionFiltersKey;

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
    queryKey: queryKeys.transactions.list(filters),
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
  qc.invalidateQueries({ queryKey: queryKeys.transactions.all });
  qc.invalidateQueries({ queryKey: queryKeys.wallets.all });
  qc.invalidateQueries({ queryKey: queryKeys.dashboard.all });
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
