'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BarChart3,
  CreditCard,
  Globe,
  Handshake,
  Calendar,
  Bell,
  BarChart2,
  ShieldCheck,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/events/contestant/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/events/contestant/ranking', label: 'Ranking', icon: BarChart2 },
  { href: '/events/contestant/analytics', label: 'Vote Analytics', icon: BarChart3 },
  { href: '/events/contestant/revenue', label: 'Revenue', icon: CreditCard },
  { href: '/events/contestant/security', label: 'Trust & Security', icon: ShieldCheck },
  { href: '/events/contestant/geographic', label: 'Geographic Votes', icon: Globe },
  { href: '/events/contestant/sponsors', label: 'Sponsors', icon: Handshake },
  { href: '/events/contestant/event', label: 'Event Details', icon: Calendar },
  { href: '/events/contestant/notifications', label: 'Notifications', icon: Bell },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen bg-slate-100 border-r border-slate-300 flex flex-col overflow-hidden">
      <nav className="flex-1 overflow-y-auto p-3 space-y-1 mt-3">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive ? 'bg-blue-700 text-white' : 'text-slate-700 hover:bg-slate-200'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-300 text-center text-xs text-slate-500">Contestant Portal</div>
    </aside>
  );
}
