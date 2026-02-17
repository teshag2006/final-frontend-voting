'use client';

import { ProtectedRouteWrapper } from '@/components/auth/protected-route-wrapper';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRouteWrapper requiredRole="admin" fallbackUrl="/login">
      {children}
    </ProtectedRouteWrapper>
  );
}
