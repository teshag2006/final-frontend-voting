import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { ProtectedRouteWrapper } from '@/components/auth/protected-route-wrapper';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { DashboardHeader } from '@/components/dashboard/header';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Contestant Dashboard | Miss & Mr Africa',
  description: 'Monitor your votes, rankings, and analytics.',
};

function ContestantLayoutContent({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="contestant-shell h-screen bg-slate-200 flex flex-col overflow-hidden">
      {/* Full-width top banner */}
      <DashboardHeader />

      {/* Content area below top banner */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar starts below top banner */}
        <DashboardSidebar />

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-slate-100">{children}</main>
      </div>
    </div>
  );
}

export default function ContestantLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ProtectedRouteWrapper
      requiredRole="contestant"
      fallbackUrl="/events"
    >
      <ContestantLayoutContent>{children}</ContestantLayoutContent>
    </ProtectedRouteWrapper>
  );
}

