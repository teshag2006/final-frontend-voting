'use client';

import { ProtectedRouteWrapper } from '@/components/auth/protected-route-wrapper';

export default function VoterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRouteWrapper requiredRole="voter" fallbackUrl="/login">
      {children}
    </ProtectedRouteWrapper>
  );
}
