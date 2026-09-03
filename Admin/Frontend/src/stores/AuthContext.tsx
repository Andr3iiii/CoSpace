import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../api/auth.api';
import { AdminUser } from '../types';

interface AuthContextType {
  admin: AdminUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function safeGetStoredAdmin(): AdminUser | null {
  try {
    const saved = localStorage.getItem('cospace_admin_user');
    if (!saved || saved === 'undefined' || saved === 'null') {
      localStorage.removeItem('cospace_admin_user');
      return null;
    }
    return JSON.parse(saved);
  } catch {
    localStorage.removeItem('cospace_admin_user');
    return null;
  }
}

function safeGetStoredAdminToken(): string | null {
  try {
    const token = localStorage.getItem('cospace_admin_token');
    if (!token || token === 'undefined' || token === 'null') {
      localStorage.removeItem('cospace_admin_token');
      return null;
    }
    return token;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(() => safeGetStoredAdmin());
  const [token, setToken] = useState<string | null>(() => safeGetStoredAdminToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function initAuth() {
      if (token) {
        try {
          const profile = await authApi.me();
          if (profile) {
            setAdmin(profile);
            localStorage.setItem('cospace_admin_user', JSON.stringify(profile));
          } else {
            logout();
          }
        } catch (err) {
          console.error('Session validation failed:', err);
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
      localStorage.setItem('cospace_admin_token', res.token);
    }
    if (res?.admin) {
      setAdmin(res.admin);
      localStorage.setItem('cospace_admin_user', JSON.stringify(res.admin));
    }
  };

  const logout = async () => {
    try {
      if (token) await authApi.logout();
    } catch {}
    setToken(null);
    setAdmin(null);
    localStorage.removeItem('cospace_admin_token');
    localStorage.removeItem('cospace_admin_user');
  };

  return (
    <AuthContext.Provider value={{ admin, token, isLoading, login, logout }}>
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
