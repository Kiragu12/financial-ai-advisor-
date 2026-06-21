import { createContext, useMemo, type ReactNode } from 'react';
import { useMe } from '../../api/hooks/use-auth';
import type { PublicUser } from '../../api/types';

/**
 * Auth state for the app, backed by the cookie-based `['me']` query.
 *
 * There is no token to store: the session lives in an httpOnly cookie the
 * browser sends automatically. This context just exposes the current user and
 * whether we're still checking. Login/register/logout actions live in the
 * dedicated hooks (api/hooks/use-auth) and update the same `['me']` cache.
 */

export type AuthContextValue = {
  user: PublicUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
};

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data, isLoading } = useMe();
  const user = data ?? null;

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: user !== null, isLoading }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
