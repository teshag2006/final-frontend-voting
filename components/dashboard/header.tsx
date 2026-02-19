'use client';

import { Bell, LogOut, ChevronDown, CheckCircle2, Crown } from 'lucide-react';
import { useState } from 'react';

export function DashboardHeader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-gradient-to-r from-slate-900 to-blue-900 border-b border-blue-900 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-300/20 text-amber-300">
            <Crown className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-semibold text-white">Miss & Mister Continental 2026</h1>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-5">
          {/* Notifications */}
          <button
            className="p-2 text-slate-100 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-expanded={isOpen}
              aria-haspopup="menu"
            >
              <span className="text-sm text-slate-100">Amina Tesfaye</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-300" />
              <div className="w-8 h-8 bg-gradient-to-br from-amber-200 to-orange-300 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">AT</span>
              </div>
              <div className="text-left text-white text-sm font-semibold">Active</div>
              <ChevronDown className="w-4 h-4 text-slate-200" />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
              <div
                className="absolute right-0 mt-2 w-48 bg-white rounded-lg border border-slate-200 shadow-lg z-50"
                role="menu"
              >
                <button className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors">
                  Profile Settings
                </button>
                <hr className="my-2 border-slate-200" />
                <button className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
