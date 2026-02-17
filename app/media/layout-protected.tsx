'use client';

import { ProtectedRouteWrapper } from '@/components/auth/protected-route-wrapper';

export default function MediaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRouteWrapper requiredRole="media" fallbackUrl="/login">
      {children}
    </ProtectedRouteWrapper>
  );
}
