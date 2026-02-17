'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { UserRole } from '@/lib/mock-users';

interface ProtectedRouteWrapperProps {
  children: ReactNode;
  requiredRole?: UserRole | UserRole[];
  fallbackUrl?: string;
  autoSignInWith?: UserRole;
}

function ProtectedRouteContent({
  children,
  requiredRole,
  fallbackUrl = '/login',
}: Omit<ProtectedRouteWrapperProps, 'children'> & { children: ReactNode }) {
  const { user, isLoading, isAuthenticated, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // Not authenticated - redirect to login
    if (!isAuthenticated) {
      router.push(fallbackUrl);
      return;
    }

    // Check required role
    if (requiredRole && !hasRole(requiredRole)) {
      router.push('/access-denied');
      return;
    }
  }, [isLoading, isAuthenticated, requiredRole, router, fallbackUrl, hasRole]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-r-transparent"></div>
          <p className="mt-4 text-slate-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Check if user has required role
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-white">Access Denied</h1>
          <p className="text-slate-400">You don't have permission to access this page.</p>
          <button
            onClick={() => router.push('/')}
            className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export function ProtectedRouteWrapper({
  children,
  requiredRole,
  fallbackUrl,
}: ProtectedRouteWrapperProps) {
  return (
    <AuthProvider>
      <ProtectedRouteContent
        requiredRole={requiredRole}
        fallbackUrl={fallbackUrl}
      >
        {children}
      </ProtectedRouteContent>
    </AuthProvider>
  );
}

