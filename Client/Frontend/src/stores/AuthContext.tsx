import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../api/auth.api';
import { ClientUser } from '../types';

interface AuthContextType {
  client: ClientUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
}

declare global {
  var __COSPACE_AUTH_CONTEXT__: React.Context<AuthContextType | undefined> | undefined;
}

export const AuthContext: React.Context<AuthContextType | undefined> =
  (typeof globalThis !== 'undefined' && (globalThis as any).__COSPACE_AUTH_CONTEXT__) ||
  ((globalThis as any).__COSPACE_AUTH_CONTEXT__ = createContext<AuthContextType | undefined>(undefined));

function safeGetStoredUser(): ClientUser | null {
  try {
    const saved = localStorage.getItem('cospace_client_user');
    if (!saved || saved === 'undefined' || saved === 'null') {
      localStorage.removeItem('cospace_client_user');
      return null;
    }
    return JSON.parse(saved);
  } catch {
    localStorage.removeItem('cospace_client_user');
    return null;
  }
}

function safeGetStoredToken(): string | null {
  try {
    const token = localStorage.getItem('cospace_client_token');
    if (!token || token === 'undefined' || token === 'null') {
      localStorage.removeItem('cospace_client_token');
      return null;
    }
    return token;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<ClientUser | null>(() => safeGetStoredUser());
  const [token, setToken] = useState<string | null>(() => safeGetStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function initAuth() {
      if (token) {
        try {
          const profile = await authApi.me();
          if (profile) {
            setClient(profile);
            localStorage.setItem('cospace_client_user', JSON.stringify(profile));
          } else {
            logout();
          }
        } catch (err) {
          console.error('Session expired:', err);
          logout();
        }
      }
      setIsLoading(false);
    }
    initAuth();
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    if (res?.token) {
      setToken(res.token);
      localStorage.setItem('cospace_client_token', res.token);
    }
    if (res?.client) {
      setClient(res.client);
      localStorage.setItem('cospace_client_user', JSON.stringify(res.client));
    }
  };

  const register = async (data: any) => {
    const res = await authApi.register(data);
    if (res?.token) {
      setToken(res.token);
      localStorage.setItem('cospace_client_token', res.token);
    }
    if (res?.client) {
      setClient(res.client);
      localStorage.setItem('cospace_client_user', JSON.stringify(res.client));
    }
  };

  const logout = async () => {
    try {
      if (token) await authApi.logout();
    } catch {}
    setToken(null);
    setClient(null);
    localStorage.removeItem('cospace_client_token');
    localStorage.removeItem('cospace_client_user');
  };

  return (
    <AuthContext.Provider value={{ client, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
