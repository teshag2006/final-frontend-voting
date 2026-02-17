'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole, UserProfile, UserPreferences, LoginRecord, SessionRecord } from '@/lib/mock-users';
import { authenticateUser, getUserById } from '@/lib/mock-users';
import { authService } from '@/lib/services/authService';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  eventId?: string;
  profile?: UserProfile;
  preferences?: UserPreferences;
  loginHistory?: LoginRecord[];
  activeSessions?: SessionRecord[];
  createdAt?: string;
}

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
  updateProfile: (profile: Partial<UserProfile>) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const checkExistingAuth = () => {
      setIsLoading(true);
      try {
        // Use synchronous check with localStorage - faster than async
        const storedUserId = localStorage.getItem('auth_user_id');
        const storedRole = localStorage.getItem('auth_user_role');
        
        if (storedUserId && storedRole) {
          const retrievedUser = getUserById(storedUserId);
          if (retrievedUser) {
            const { password: _, ...userWithoutPassword } = retrievedUser as any;
            setUser(userWithoutPassword as AuthUser);
          } else {
            // User not found, clear auth
            localStorage.removeItem('auth_user_id');
            localStorage.removeItem('auth_user_role');
            localStorage.removeItem('auth_token');
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        // Use requestIdleCallback for non-critical UI updates
        if (typeof requestIdleCallback !== 'undefined') {
          requestIdleCallback(() => setIsLoading(false));
        } else {
          setIsLoading(false);
        }
      }
    };

    checkExistingAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Use auth service for login - separates UI from business logic
      const response = await authService.login(email, password);

      if (!response.success) {
        throw new Error(response.error || 'Login failed');
      }

      if (!response.user) {
        throw new Error('No user data returned');
      }

      // Convert to AuthUser
      const user: AuthUser = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        role: response.user.role as UserRole,
        avatar: response.user.avatar,
      };

      // Get full user data including profile
      const fullUser = getUserById(user.id);
      if (fullUser) {
        const { password: _, ...userWithoutPassword } = fullUser as any;
        setUser({ ...userWithoutPassword, ...user } as AuthUser);
      } else {
        setUser(user);
      }

      // Store auth info in localStorage and cookies
      localStorage.setItem('auth_user_id', response.user.id);
      localStorage.setItem('auth_user_role', response.user.role);
      
      // Set cookie for middleware access
      if (typeof document !== 'undefined') {
        document.cookie = `user_role=${response.user.role}; path=/; max-age=3600; SameSite=Lax`;
        document.cookie = `auth_token=${response.token}; path=/; max-age=3600; SameSite=Lax`;
      }
      // Tokens are also stored by authService
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      setUser(null);
      authService.logout();
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setError(null);
    // Use auth service logout - handles token cleanup and browser cleanup
    authService.logout();
  };

  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(user.role);
  };

  const clearError = () => setError(null);

  const updateProfile = (profile: Partial<UserProfile>) => {
    if (user) {
      setUser({
        ...user,
        profile: {
          ...user.profile,
          ...profile,
        } as UserProfile,
      });
    }
  };

  const updatePreferences = (preferences: Partial<UserPreferences>) => {
    if (user) {
      setUser({
        ...user,
        preferences: {
          ...user.preferences,
          ...preferences,
        } as UserPreferences,
      });
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
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
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
