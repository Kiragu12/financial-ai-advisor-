import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../client';
import { queryKeys } from '../query-keys';
import type { Budget, BudgetResponse, BudgetsResponse } from '../types';

export function useBudgets(month?: string) {
  return useQuery({
    queryKey: queryKeys.budgets.list(month),
    queryFn: async (): Promise<Budget[]> => {
      const query = month ? `?month=${month}` : '';
      const { budgets } = await api.get<BudgetsResponse>(`/api/budgets${query}`);
      return budgets;
    },
  });
}

export interface CreateBudgetInput {
  categoryId: string;
  amount: number;
}

export function useCreateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateBudgetInput) => api.post<BudgetResponse>('/api/budgets', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.budgets.all });
    },
  });
}

export interface UpdateBudgetInput {
  budgetId: string;
  amount: number;
}

export function useUpdateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ budgetId, ...body }: UpdateBudgetInput) =>
      api.patch<BudgetResponse>(`/api/budgets/${budgetId}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.budgets.all });
    },
  });
}

export function useDeleteBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (budgetId: string) => api.delete<BudgetResponse>(`/api/budgets/${budgetId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.budgets.all });
    },
  });
}
