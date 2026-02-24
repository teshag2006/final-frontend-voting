'use client';

import { CheckCircle, LogOut, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardHeaderProps {
  eventName: string;
  isVerified: boolean;
  maskedPhone: string;
  onLogout?: () => void;
}

export function DashboardHeader({
  eventName,
  isVerified,
  maskedPhone,
  onLogout,
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-blue-900 bg-gradient-to-r from-slate-900 to-blue-900 px-6 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-300/20 text-amber-300">
            <span className="text-sm font-bold">★</span>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-blue-200">Voter workspace</p>
            <h1 className="text-2xl font-semibold text-white">Voter Dashboard</h1>
            <p className="text-xs text-blue-100">{eventName}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {isVerified && (
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-300/20 px-3 py-1.5">
              <CheckCircle className="h-4 w-4 text-emerald-200" />
              <span className="text-xs font-medium text-emerald-100">Verified</span>
            </div>
          )}

          <div className="hidden items-center gap-1 text-xs text-blue-100 sm:flex">
            <Phone className="h-3 w-3" />
            {maskedPhone}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="gap-1.5 text-slate-100 hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
