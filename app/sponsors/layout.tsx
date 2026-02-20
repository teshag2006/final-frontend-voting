import type { ReactNode } from 'react';
import { ProtectedRouteWrapper } from '@/components/auth/protected-route-wrapper';
import { SponsorSidebar } from '@/components/sponsors/sponsor-sidebar';

interface SponsorsLayoutProps {
  children: ReactNode;
}

export default function SponsorsLayout({ children }: SponsorsLayoutProps) {
  return (
    <ProtectedRouteWrapper requiredRole="sponsor" fallbackUrl="/login">
      <div className="min-h-screen bg-slate-100 [&_.text-xs]:text-sm [&_.text-sm]:text-base">
        <div className="grid min-h-screen lg:grid-cols-[220px_minmax(0,1fr)]">
          <div className="rounded-xl border border-slate-800/70 bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 shadow-xl lg:min-h-screen lg:rounded-none lg:border-y-0 lg:border-l-0 lg:pt-6">
            <SponsorSidebar />
          </div>
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </ProtectedRouteWrapper>
  );
}
