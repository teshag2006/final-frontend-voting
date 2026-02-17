'use client';

import Link from 'next/link';
import { LogOut, CheckCircle, Phone } from 'lucide-react';
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
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Left Section */}
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">★</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">Campus Star 2026</span>
            <span className="text-xs text-muted-foreground">{eventName}</span>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            {isVerified && (
              <div className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-xs font-medium text-green-700">Verified</span>
              </div>
            )}
            <div className="hidden flex-col items-end sm:flex">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Phone className="h-3 w-3" />
                {maskedPhone}
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="gap-1.5"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
