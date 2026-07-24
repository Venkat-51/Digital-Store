import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { User, AuthTokens } from '@/types/user.types';
import { authService } from '@/services/auth.service';
import { storage } from '@/utils/helpers';
import { CONFIG } from '@/constants/config';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: Parameters<typeof authService.register>[0]) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user on mount if token exists
  useEffect(() => {
    const initAuth = async () => {
      const token = storage.get<string>(CONFIG.TOKEN_KEY);
      if (token) {
        try {
          const me = await authService.me();
          setUser(me);
        } catch {
          storage.remove(CONFIG.TOKEN_KEY);
          storage.remove(CONFIG.REFRESH_TOKEN_KEY);
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const storeTokens = (tokens: AuthTokens) => {
    storage.set(CONFIG.TOKEN_KEY, tokens.access);
    storage.set(CONFIG.REFRESH_TOKEN_KEY, tokens.refresh);
  };

  const login = useCallback(async (email: string, password: string) => {
    const { tokens, user } = await authService.login({ email, password });
    storeTokens(tokens);
    setUser(user);
    return user;
  }, []);

  const register = useCallback(async (payload: Parameters<typeof authService.register>[0]) => {
    const { tokens, user } = await authService.register(payload);
    storeTokens(tokens);
    setUser(user);
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = storage.get<string>(CONFIG.REFRESH_TOKEN_KEY);
    if (refreshToken) {
      try {
        await authService.logout(refreshToken);
      } catch {
        /* ignore */
      }
    }
    storage.remove(CONFIG.TOKEN_KEY);
    storage.remove(CONFIG.REFRESH_TOKEN_KEY);
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, login, register, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
};
