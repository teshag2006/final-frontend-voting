'use client';

import { Bell, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export function DashboardHeader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-white border-b border-border px-8 py-4">
      <div className="flex items-center justify-between h-16">
        {/* Left Section */}
        <div className="flex items-center gap-8">
          <h1 className="text-xl font-bold text-foreground">
            Miss & Mister Continental 2026
          </h1>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-6">
          {/* Notifications */}
          <button
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-muted-foreground" />
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-3 px-3 py-2 hover:bg-secondary rounded-lg transition-colors"
              aria-expanded={isOpen}
              aria-haspopup="menu"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">AT</span>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">Amina TestAye</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
              <div
                className="absolute right-0 mt-2 w-48 bg-white rounded-lg border border-border shadow-lg z-50"
                role="menu"
              >
                <button className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors">
                  Profile Settings
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors">
                  Account
                </button>
                <hr className="my-2 border-border" />
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
