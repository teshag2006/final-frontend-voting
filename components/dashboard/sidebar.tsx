'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  TrendingUp,
  BarChart3,
  DollarSign,
  Shield,
  Globe,
  Users,
  Calendar,
  Bell,
  Award,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/events/contestant/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/events/contestant/ranking', label: 'Ranking', icon: Award },
  { href: '/events/contestant/analytics', label: 'Vote Analytics', icon: BarChart3 },
  { href: '/events/contestant/revenue', label: 'Revenue', icon: DollarSign },
  { href: '/events/contestant/security', label: 'Trust & Security', icon: Shield },
  { href: '/events/contestant/geographic', label: 'Geographic Votes', icon: Globe },
  { href: '/events/contestant/sponsors', label: 'Sponsors', icon: Users },
  { href: '/events/contestant/event', label: 'Event Details', icon: Calendar },
  { href: '/events/contestant/notifications', label: 'Notifications', icon: Bell },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen bg-white border-r border-border flex flex-col overflow-hidden">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">👑</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Dashboard</p>
            <p className="text-xs text-muted-foreground">Contestant Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-scroll p-4 pr-2 space-y-2 [scrollbar-gutter:stable] [scrollbar-width:thin] [scrollbar-color:hsl(var(--muted-foreground))_transparent] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 hover:[&::-webkit-scrollbar-thumb]:bg-slate-400">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-secondary'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          © 2024 Miss & Mr Africa
        </p>
      </div>
    </aside>
  );
}
