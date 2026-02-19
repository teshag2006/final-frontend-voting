import type { ReactNode } from 'react';
import { ProtectedRouteWrapper } from '@/components/auth/protected-route-wrapper';

interface SponsorsLayoutProps {
  children: ReactNode;
}

export default function SponsorsLayout({ children }: SponsorsLayoutProps) {
  return (
    <ProtectedRouteWrapper requiredRole="sponsor" fallbackUrl="/login">
      {children}
    </ProtectedRouteWrapper>
  );
}
