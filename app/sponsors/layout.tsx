import type { ReactNode } from 'react';
import { ProtectedRouteWrapper } from '@/components/auth/protected-route-wrapper';
import { SponsorSidebar } from '@/components/sponsors/sponsor-sidebar';

interface SponsorsLayoutProps {
  children: ReactNode;
}

export default function SponsorsLayout({ children }: SponsorsLayoutProps) {
  return (
    <ProtectedRouteWrapper requiredRole="sponsor" fallbackUrl="/login">
      <div className="min-h-screen bg-slate-100 [&_.text-xs]:text-sm">
        <div className="grid gap-4 px-2 py-6 sm:px-3 lg:grid-cols-[200px_minmax(0,1fr)] lg:px-4">
          <SponsorSidebar />
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </ProtectedRouteWrapper>
  );
}
