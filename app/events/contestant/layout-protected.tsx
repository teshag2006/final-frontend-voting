'use client';

import { ProtectedRouteWrapper } from '@/components/auth/protected-route-wrapper';

export default function ContestantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRouteWrapper requiredRole="contestant" fallbackUrl="/login">
      {children}
    </ProtectedRouteWrapper>
  );
}
