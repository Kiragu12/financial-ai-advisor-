import { useQuery } from '@tanstack/react-query';
import { api } from '../client';
import type {
  Cashflow,
  DashboardSummary,
  SpendingByCategory,
  SummaryResponse,
} from '../types';

/**
 * Read-only dashboard analytics. All three keys live under ['dashboard'] so the
 * money mutations elsewhere can invalidate the whole group with one call.
 */

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard', 'summary'] as const,
    queryFn: async (): Promise<DashboardSummary> => {
      const { summary } = await api.get<SummaryResponse>('/api/dashboard/summary');
      return summary;
    },
  });
}

export function useSpendingByCategory() {
  return useQuery({
    queryKey: ['dashboard', 'spending'] as const,
    queryFn: () => api.get<SpendingByCategory>('/api/dashboard/spending-by-category'),
  });
}

export function useCashflow(months = 6) {
  return useQuery({
    queryKey: ['dashboard', 'cashflow', months] as const,
    queryFn: () => api.get<Cashflow>(`/api/dashboard/cashflow?months=${months}`),
  });
}
