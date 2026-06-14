import { useQuery } from '@tanstack/react-query';
import { api } from '../client';
import type { HealthResponse } from '../types';

export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: ({ signal }) => api.get<HealthResponse>('/api/health', { signal }),
    refetchInterval: 30_000,
    staleTime: 10_000,
  });
}
