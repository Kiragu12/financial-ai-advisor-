import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../client';
import type {
  ContributionResponse,
  Goal,
  GoalResponse,
  GoalsResponse,
  GoalStatus,
} from '../types';

/**
 * Goal data hooks. A wallet-funded contribution moves a wallet balance and
 * writes a transaction, so contribute invalidates wallets/transactions/dashboard
 * in addition to goals.
 */

export const GOALS_KEY = ['goals'] as const;

export function useGoals(status?: GoalStatus) {
  return useQuery({
    queryKey: ['goals', status ?? 'all'] as const,
    queryFn: async (): Promise<Goal[]> => {
      const query = status ? `?status=${status}` : '';
      const { goals } = await api.get<GoalsResponse>(`/api/goals${query}`);
      return goals;
    },
  });
}

export interface CreateGoalInput {
  name: string;
  targetAmount: number;
  deadline?: string;
}

export function useCreateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateGoalInput) => api.post<GoalResponse>('/api/goals', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: GOALS_KEY });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export interface ContributeInput {
  goalId: string;
  amount: number;
  walletId?: string;
  contributionDate?: string;
  note?: string;
}

export function useContribute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ goalId, ...body }: ContributeInput) =>
      api.post<ContributionResponse>(`/api/goals/${goalId}/contributions`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: GOALS_KEY });
      qc.invalidateQueries({ queryKey: ['wallets'] });
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
