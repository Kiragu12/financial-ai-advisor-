import { useQuery } from '@tanstack/react-query';
import { api } from '../client';
import { queryKeys } from '../query-keys';
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
    queryKey: queryKeys.dashboard.summary,
    queryFn: async (): Promise<DashboardSummary> => {
      const { summary } = await api.get<SummaryResponse>('/api/dashboard/summary');
      return summary;
    },
  });
}

export function useSpendingByCategory() {
  return useQuery({
    queryKey: queryKeys.dashboard.spending,
    queryFn: () => api.get<SpendingByCategory>('/api/dashboard/spending-by-category'),
  });
}

export function useCashflow(months = 6) {
  return useQuery({
    queryKey: queryKeys.dashboard.cashflow(months),
    queryFn: () => api.get<Cashflow>(`/api/dashboard/cashflow?months=${months}`),
  });
}
