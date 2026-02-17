'use client';

import Link from 'next/link';
import { Settings, Bell, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AdminHeader() {
  return (
    <header className="border-b border-border bg-card sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage all voting events and monitor real-time statistics
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="hidden sm:flex gap-2">
              <Bell className="h-4 w-4" />
              <span className="text-sm">Notifications</span>
            </Button>

            <Button variant="ghost" size="sm" className="hidden sm:flex gap-2">
              <Settings className="h-4 w-4" />
              <span className="text-sm">Settings</span>
            </Button>

            <Button variant="outline" size="sm" className="gap-2">
              <LogOut className="h-4 w-4" />
              <span className="text-sm">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
