import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { ProtectedRouteWrapper } from '@/components/auth/protected-route-wrapper';
import { AdminShell } from '@/components/admin/admin-shell';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Manage contests, voters, and system settings.',
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <ProtectedRouteWrapper
      requiredRole="admin"
      fallbackUrl="/events"
    >
      <AdminShell>{children}</AdminShell>
    </ProtectedRouteWrapper>
  );
}

