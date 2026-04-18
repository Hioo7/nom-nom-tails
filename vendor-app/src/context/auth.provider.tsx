import { createContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { AuthService } from '../services/auth.service';
import { MeService } from '../services/me.service';
import type { AuthContextValue, SafeUser } from '../types';

const TOKEN_KEY = 'vendor_auth_token';

const authService = new AuthService();
const meService = new MeService();

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<SafeUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    meService
      .getMe(token)
      .then(setUser)
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string): Promise<SafeUser> => {
    const data = await authService.login({ email, password });
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = (): void => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  const refreshUser = async (): Promise<void> => {
    if (!token) return;
    const updated = await meService.getMe(token);
    setUser(updated);
  };

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, isLoading, login, logout, refreshUser }),
    [user, token, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
