import type { ReactNode } from 'react';
import { Bell, Crown } from 'lucide-react';
import { ProtectedRouteWrapper } from '@/components/auth/protected-route-wrapper';
import { SponsorSidebar } from '@/components/sponsors/sponsor-sidebar';
import { SponsorLogoutButton } from '@/components/sponsors/sponsor-logout-button';

interface SponsorsLayoutProps {
  children: ReactNode;
}

export default function SponsorsLayout({ children }: SponsorsLayoutProps) {
  return (
    <ProtectedRouteWrapper requiredRole="sponsor" fallbackUrl="/login">
      <div className="min-h-screen bg-slate-200 [&_.text-xs]:text-sm [&_.text-sm]:text-base">
        <header className="sticky top-0 z-40 border-b border-blue-900 bg-gradient-to-r from-slate-900 to-blue-900 px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-300/20 text-amber-300">
                <Crown className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-blue-200">Sponsorship workspace</p>
                <h1 className="text-2xl font-semibold text-white">Sponsor Portal</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-lg p-2 text-slate-100 transition-colors hover:bg-white/10" aria-label="Notifications">
                <Bell className="h-5 w-5" />
              </button>
              <SponsorLogoutButton />
            </div>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 lg:grid-cols-[256px_minmax(0,1fr)]">
          <div>
            <SponsorSidebar />
          </div>
          <div className="min-w-0 bg-slate-100">{children}</div>
        </div>
      </div>
    </ProtectedRouteWrapper>
  );
}
