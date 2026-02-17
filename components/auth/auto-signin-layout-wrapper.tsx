'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSearchParams } from 'next/navigation';

interface AutoSignInLayoutWrapperProps {
  children: React.ReactNode;
  defaultRole?: 'voter' | 'contestant' | 'media' | 'admin';
}

export function AutoSignInLayoutWrapper({
  children,
  defaultRole = 'voter',
}: AutoSignInLayoutWrapperProps) {
  const { user, autoSignInByRole } = useAuth() as any;
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!user) {
      // Check for query param auto sign-in
      const autoSignInParam = searchParams.get('autoSignIn');
      if (autoSignInParam === 'voter' || autoSignInParam === 'contestant' || autoSignInParam === 'media' || autoSignInParam === 'admin') {
        autoSignInByRole?.(autoSignInParam);
      } else if (defaultRole) {
        // Use default role for protected routes
        autoSignInByRole?.(defaultRole);
      }
    }
  }, [user, autoSignInByRole, searchParams, defaultRole]);

  return <>{children}</>;
}
