'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
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
  ClipboardCheck,
  UserCog,
  Image,
  Moon,
  Sun,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/events/contestant/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/events/contestant/ranking', label: 'Ranking', icon: BarChart2 },
  { href: '/events/contestant/analytics', label: 'Vote Analytics', icon: BarChart3 },
  { href: '/events/contestant/revenue', label: 'Revenue', icon: CreditCard },
  { href: '/events/contestant/security', label: 'Trust & Security', icon: ShieldCheck },
  { href: '/events/contestant/geographic', label: 'Geographic Votes', icon: Globe },
  { href: '/events/contestant/sponsors', label: 'Sponsors', icon: Handshake },
  { href: '/events/contestant/onboarding', label: 'Onboarding', icon: ClipboardCheck },
  { href: '/events/contestant/gallery', label: 'Gallery', icon: Image },
  { href: '/events/contestant/profile-editor', label: 'Profile Editor', icon: UserCog },
  { href: '/events/contestant/event', label: 'Event Details', icon: Calendar },
  { href: '/events/contestant/notifications', label: 'Notifications', icon: Bell },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<'brand' | 'light'>('brand');

  useEffect(() => {
    const stored = localStorage.getItem('contestant_sidebar_theme');
    if (stored === 'brand' || stored === 'light') {
      setTheme(stored);
    }
  }, []);

  const isBrand = theme === 'brand';

  const toggleTheme = () => {
    const next = isBrand ? 'light' : 'brand';
    setTheme(next);
    localStorage.setItem('contestant_sidebar_theme', next);
  };

  return (
    <aside
      className={`w-64 h-full flex flex-col overflow-hidden border-r ${
        isBrand
          ? 'bg-gradient-to-b from-slate-900 to-blue-900 border-blue-900'
          : 'bg-slate-100 border-slate-300'
      }`}
    >
      <nav className="flex-1 overflow-y-auto p-3 space-y-1 mt-3">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? isBrand
                    ? 'bg-white/20 text-white'
                    : 'bg-blue-700 text-white'
                  : isBrand
                    ? 'text-slate-100 hover:bg-white/10'
                    : 'text-slate-700 hover:bg-slate-200'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className={`p-3 border-t ${isBrand ? 'border-white/20' : 'border-slate-300'}`}>
        <button
          type="button"
          onClick={toggleTheme}
          className={`mb-2 flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition ${
            isBrand
              ? 'bg-white/10 text-slate-100 hover:bg-white/20'
              : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
          }`}
        >
          {isBrand ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          <span>{isBrand ? 'Switch to Light' : 'Switch to Topbar Color'}</span>
        </button>
      </div>
    </aside>
  );
}
