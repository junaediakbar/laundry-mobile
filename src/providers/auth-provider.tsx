import { useQueryClient } from '@tanstack/react-query';
import { type ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { qk } from '@/lib/query-keys';
import { clearStoredToken, getStoredToken, setStoredToken } from '@/services/auth-storage';
import { meRequest, type LoginResult } from '@/services/auth.service';
import { ApiClientError } from '@/types/api';
import type { User } from '@/types/models';

type AuthContextValue = {
  token: string | null;
  user: User | null;
  isReady: boolean;
  signIn: (result: LoginResult) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);

  const hydrate = useCallback(async () => {
    const t = await getStoredToken();
    setToken(t);
    if (!t) {
      setUser(null);
      setIsReady(true);
      return;
    }
    try {
      const u = await meRequest();
      setUser(u);
    } catch (e) {
      if (e instanceof ApiClientError && (e.status === 401 || e.status === 403)) {
        await clearStoredToken();
        setToken(null);
        setUser(null);
      }
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const signIn = useCallback(async (result: LoginResult) => {
    await setStoredToken(result.token);
    setToken(result.token);
    setUser(result.user);
    await queryClient.invalidateQueries({ queryKey: qk.me });
  }, [queryClient]);

  const signOut = useCallback(async () => {
    await clearStoredToken();
    setToken(null);
    setUser(null);
    queryClient.clear();
  }, [queryClient]);

  const refreshUser = useCallback(async () => {
    if (!token) return;
    try {
      const u = await meRequest();
      setUser(u);
    } catch {
      /* ignore transient errors */
    }
  }, [token]);

  const value = useMemo(
    () => ({
      token,
      user,
      isReady,
      signIn,
      signOut,
      refreshUser,
    }),
    [token, user, isReady, signIn, signOut, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}
