'use client';

import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { DashboardHeader } from '@/components/voter-dashboard/dashboard-header';
import { VoterSidebarNav } from '@/components/voter/voter-sidebar-nav';

interface VoterUnifiedShellProps {
  children: ReactNode;
}

export function VoterUnifiedShell({ children }: VoterUnifiedShellProps) {
  const router = useRouter();
  const { logout } = useAuth();
  const [runtimeState, setRuntimeState] = useState(() => ({
    isVerified: false,
    maskedPhone: 'Not verified',
    eventName: 'Voting Dashboard',
  }));

  useEffect(() => {
    let mounted = true;
    const loadWallet = async () => {
      try {
        const response = await fetch('/api/voter/wallet', { cache: 'no-store' });
        if (!response.ok || !mounted) return;
        const wallet = await response.json();
        const phone = String(wallet?.phoneNumber || '');
        const digits = phone.replace(/\D/g, '');
        const maskedPhone =
          digits.length >= 7
            ? `+${digits.slice(0, 3)} ${digits.slice(3, 4)}XX XXX ${digits.slice(-3)}`
            : 'Not verified';
        setRuntimeState({
          isVerified: Boolean(wallet?.isPhoneVerified),
          maskedPhone,
          eventName: String(wallet?.eventName || wallet?.event_name || 'Voting Dashboard'),
        });
      } catch {
        // Keep defaults in dev fallback mode.
      }
    };

    void loadWallet();
    return () => {
      mounted = false;
    };
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const headerData = useMemo(
    () => ({
      eventName: runtimeState.eventName,
      isVerified: runtimeState.isVerified,
      maskedPhone: runtimeState.maskedPhone,
    }),
    [runtimeState]
  );

  return (
    <div className="min-h-screen bg-slate-200">
      <DashboardHeader
        eventName={headerData.eventName}
        isVerified={headerData.isVerified}
        maskedPhone={headerData.maskedPhone}
        onLogout={handleLogout}
      />

      <main className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[256px_minmax(0,1fr)]">
          <VoterSidebarNav />
          <div className="min-w-0 px-4 py-8 sm:px-6 lg:px-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
