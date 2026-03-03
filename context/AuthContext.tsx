'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authService } from '@/lib/services/authService';
import type { AuthUser, UserRole } from '@/lib/types';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  userRole: UserRole | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  error: string | null;
  clearError: () => void;
  updateProfile: (profile: any) => void;
  updatePreferences: (_preferences: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hydrate = useCallback(async () => {
    setIsLoading(true);
    try {
      const profile = await authService.getProfile();
      if (profile) {
        setUser(profile);
        localStorage.setItem('auth_user_role', profile.role);
        localStorage.setItem('auth_user_id', profile.id);
        localStorage.setItem('auth_user_cache', JSON.stringify(profile));
      } else {
        const cachedRaw = localStorage.getItem('auth_user_cache');
        if (cachedRaw && authService.getToken()) {
          try {
            setUser(JSON.parse(cachedRaw) as AuthUser);
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    const res = await authService.login(email, password);
    if (!res.success || !res.user) {
      setError(res.error || 'Login failed');
      setIsLoading(false);
      throw new Error(res.error || 'Login failed');
    }
    setUser(res.user);
    setIsLoading(false);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setError(null);
  };

  const hasRole = (role: UserRole | UserRole[]) => {
    if (!user) return false;
    const allowed = Array.isArray(role) ? role : [role];
    return allowed.includes(user.role);
  };

  const clearError = () => setError(null);

  const updateProfile = (profile: any) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...profile };
      localStorage.setItem('auth_user_cache', JSON.stringify(next));
      return next;
    });
  };

  const updatePreferences = () => {
    // Placeholder to keep existing API stable for pages that call it.
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user && !!authService.getToken(),
    userRole: user?.role || null,
    login,
    logout,
    hasRole,
    error,
    clearError,
    updateProfile,
    updatePreferences,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
