import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { ProtectedRouteWrapper } from '@/components/auth/protected-route-wrapper';
import { MediaDashboardHeader } from '@/components/media/dashboard-header';

export const metadata: Metadata = {
  title: 'Media Dashboard - Contest Management',
  description: 'Real-time media broadcasting dashboard with voting analytics and blockchain verification.',
};

export default function MediaLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <ProtectedRouteWrapper
      requiredRole="media"
      fallbackUrl="/events"
    >
      <div className="min-h-screen bg-slate-950">
        <MediaDashboardHeader />
        <div className="min-w-0">{children}</div>
      </div>
    </ProtectedRouteWrapper>
  );
}

