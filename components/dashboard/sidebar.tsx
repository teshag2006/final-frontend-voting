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
  { href: '/contestant/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/contestant/ranking', label: 'Ranking', icon: Award },
  { href: '/contestant/analytics', label: 'Vote Analytics', icon: BarChart3 },
  { href: '/contestant/revenue', label: 'Revenue', icon: DollarSign },
  { href: '/contestant/security', label: 'Trust & Security', icon: Shield },
  { href: '/contestant/geographic', label: 'Geographic Votes', icon: Globe },
  { href: '/contestant/sponsors', label: 'Sponsors', icon: Users },
  { href: '/contestant/event', label: 'Event Details', icon: Calendar },
  { href: '/contestant/notifications', label: 'Notifications', icon: Bell },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-border flex flex-col">
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
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
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
