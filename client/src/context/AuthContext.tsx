import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api, { clearTokens, setTokens, apiErrorMessage } from '@/lib/api';
import type { User } from '@/types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: 'SEEKER' | 'EMPLOYER';
  }) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('hc_access');
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get('/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => clearTokens())
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string, rememberMe?: boolean) => {
    try {
      const { data } = await api.post('/auth/login', { email, password, rememberMe });
      setTokens(data.accessToken, data.refreshToken);
      setUser(data.user);
    } catch (err) {
      throw new Error(apiErrorMessage(err));
    }
  }, []);

  const register = useCallback(
    async (payload: { firstName: string; lastName: string; email: string; password: string; role: 'SEEKER' | 'EMPLOYER' }) => {
      try {
        await api.post('/auth/register', payload);
      } catch (err) {
        throw new Error(apiErrorMessage(err));
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('hc_refresh');
      if (refreshToken) await api.post('/auth/logout', { refreshToken });
    } catch {
      // ignore
    }
    clearTokens();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, setUser }),
    [user, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
