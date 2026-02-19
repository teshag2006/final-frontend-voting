'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, LogOut, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VoterSidebarNav } from '@/components/voter/voter-sidebar-nav';
import { useAuth } from '@/context/AuthContext';

interface VoterShellProps {
  children: ReactNode;
}

export function VoterShell({ children }: VoterShellProps) {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 text-white">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-blue-300/50 bg-blue-600/30 text-base">
              *
            </div>
            <div>
              <p className="text-base font-semibold">Campus Star 2026</p>
              <p className="text-xs text-blue-200">Voter Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1.5 sm:flex">
              <CheckCircle2 className="h-4 w-4 text-emerald-300" />
              <span className="text-xs font-medium text-emerald-200">Verified</span>
            </div>

            <div className="hidden items-center gap-1.5 text-xs text-blue-100 md:flex">
              <Phone className="h-3.5 w-3.5" />
              +251 XXX XXX 1U
            </div>

            <Button
              variant="secondary"
              size="sm"
              className="gap-1.5 bg-white/15 text-white hover:bg-white/25"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[1440px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-8">
        <VoterSidebarNav />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
