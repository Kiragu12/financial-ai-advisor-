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

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function useExportTransactions() {
  return useMutation({
    mutationFn: async (filters: TransactionFilters = {}) => {
      const blob = await api.download(
        `/api/transactions/export.xlsx${toQueryString(filters)}`,
      );
      const date = new Date().toISOString().slice(0, 10);
      downloadBlob(blob, `akiba-transactions-${date}.xlsx`);
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
  qc.invalidateQueries({ queryKey: queryKeys.budgets.all });
  qc.invalidateQueries({ queryKey: queryKeys.gamification.all });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateTransactionInput) =>
      api.post<TransactionResponse>('/api/transactions', body),
    onSuccess: () => invalidateMoneyViews(qc),
  });
}

export interface UpdateTransactionInput {
  transactionId: string;
  walletId?: string;
  type?: 'income' | 'expense';
  amount?: number;
  categoryId?: string | null; // null clears the category
  description?: string | null;
  transactionDate?: string;
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ transactionId, ...body }: UpdateTransactionInput) =>
      api.patch<TransactionResponse>(`/api/transactions/${transactionId}`, body),
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
