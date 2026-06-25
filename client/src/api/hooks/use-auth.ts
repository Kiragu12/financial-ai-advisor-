import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from '../client';
import { queryKeys } from '../query-keys';
import type { AuthResponse, MeResponse, PublicUser } from '../types';

/**
 * Auth data hooks (cookie-based).
 *
 * The backend sets an httpOnly cookie on login/register and exposes the current
 * user at GET /api/auth/me. There is no token to store client-side — auth state
 * is "does /me return a user?". The `['me']` query is the single source of truth
 * for that; login/register/logout update its cache so the whole app reacts.
 */

/** @deprecated Use queryKeys.me — kept for one release so external imports still resolve. */
export const ME_KEY = queryKeys.me;

/** Resolves to the signed-in user, or null when the session is invalid/absent. */
export function useMe() {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: async (): Promise<PublicUser | null> => {
      try {
        const { user } = await api.get<MeResponse>('/api/auth/me');
        return user;
      } catch (error) {
        // 401 simply means "not logged in" — a normal state, not an error.
        if (error instanceof ApiError && error.status === 401) return null;
        throw error;
      }
    },
    staleTime: 60_000,
    retry: false,
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { email: string; password: string }) =>
      api.post<AuthResponse>('/api/auth/login', body),
    onSuccess: ({ user }) => qc.setQueryData(queryKeys.me, user),
  });
}

export function useRegister() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      fullName: string;
      email: string;
      password: string;
      preferredCurrency?: string;
    }) => api.post<AuthResponse>('/api/auth/register', body),
    onSuccess: ({ user }) => qc.setQueryData(queryKeys.me, user),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<void>('/api/auth/logout'),
    onSuccess: () => {
      // Mark us logged out first…
      qc.setQueryData(queryKeys.me, null);
      // …then drop every OTHER cache (a different account mustn't see the
      // previous one's data). Crucially we do NOT remove the ['me'] query:
      // removing it while AuthProvider observes it would trigger an immediate
      // /me refetch that can race the cookie deletion and resurrect the session.
      qc.removeQueries({ predicate: (query) => query.queryKey[0] !== 'me' });
    },
  });
}
