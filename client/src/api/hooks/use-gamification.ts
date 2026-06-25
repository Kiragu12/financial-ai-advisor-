import { useQuery } from '@tanstack/react-query';
import { api } from '../client';
import { queryKeys } from '../query-keys';
import type { GamificationSummary, GamificationSummaryResponse } from '../types';

export function useGamificationSummary() {
  return useQuery({
    queryKey: queryKeys.gamification.summary,
    queryFn: async (): Promise<GamificationSummary> => {
      const { summary } = await api.get<GamificationSummaryResponse>(
        '/api/gamification/summary',
      );
      return summary;
    },
  });
}
