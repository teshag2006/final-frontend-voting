'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Still loading auth state, don't redirect yet
    if (isLoading) return;

    // Not authenticated - go to login
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Authenticated with user - route based on role
    if (user) {
      switch (user.role) {
        case 'admin':
          router.push('/admin/dashboard');
          break;
        case 'contestant':
          router.push('/events/contestant/dashboard');
          break;
        case 'media':
          router.push('/media/dashboard');
          break;
        case 'voter':
          router.push('/voter/dashboard');
          break;
        default:
          router.push('/events');
      }
    }
  }, [user, isLoading, isAuthenticated, router]);

  // Show loading state while redirecting
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-r-transparent"></div>
        <p className="mt-4 text-slate-300">Redirecting...</p>
      </div>
    </div>
  );
}
