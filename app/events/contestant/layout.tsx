import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { ProtectedRouteWrapper } from '@/components/auth/protected-route-wrapper';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardNavTabs } from '@/components/dashboard/dashboard-nav-tabs';

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
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <DashboardSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <DashboardHeader />

        {/* Navigation Tabs */}
        <DashboardNavTabs />

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-secondary/30">
          {children}
        </main>
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
      autoSignInWith="contestant"
      fallbackUrl="/events"
    >
      <ContestantLayoutContent>{children}</ContestantLayoutContent>
    </ProtectedRouteWrapper>
  );
}
