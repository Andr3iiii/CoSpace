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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<ClientUser | null>(() => {
    const saved = localStorage.getItem('cospace_client_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('cospace_client_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function initAuth() {
      if (token) {
        try {
          const profile = await authApi.me();
          setClient(profile);
          localStorage.setItem('cospace_client_user', JSON.stringify(profile));
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
    setToken(res.token);
    setClient(res.client);
    localStorage.setItem('cospace_client_token', res.token);
    localStorage.setItem('cospace_client_user', JSON.stringify(res.client));
  };

  const register = async (data: any) => {
    const res = await authApi.register(data);
    setToken(res.token);
    setClient(res.client);
    localStorage.setItem('cospace_client_token', res.token);
    localStorage.setItem('cospace_client_user', JSON.stringify(res.client));
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
