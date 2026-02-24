'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Moon, Search, Settings, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/sponsors', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/sponsors/discover', label: 'Discover Contestants', icon: Search },
  { href: '/sponsors/settings', label: 'Profile Settings', icon: Settings },
];

export function SponsorSidebar() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<'default' | 'topbar-dark'>('default');

  useEffect(() => {
    const stored = localStorage.getItem('sponsor_sidebar_theme');
    if (stored === 'topbar-dark' || stored === 'default') {
      setTheme(stored);
    }
  }, []);

  const setSidebarTheme = (next: 'default' | 'topbar-dark') => {
    setTheme(next);
    localStorage.setItem('sponsor_sidebar_theme', next);
  };

  return (
    <aside
      className={cn(
        'flex h-full w-64 flex-col overflow-hidden pt-4',
        theme === 'topbar-dark'
          ? 'border-r border-blue-950 bg-gradient-to-b from-slate-900 to-blue-900'
          : 'border-r border-slate-300 bg-slate-100'
      )}
    >
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === '/sponsors' ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-4 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? theme === 'topbar-dark'
                    ? 'bg-amber-300/20 text-amber-200'
                    : 'bg-blue-700 text-white'
                  : theme === 'topbar-dark'
                    ? 'text-slate-100 hover:bg-white/10'
                    : 'text-slate-700 hover:bg-slate-200'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div
        className={cn(
          'border-t p-3',
          theme === 'topbar-dark' ? 'border-blue-950/80' : 'border-slate-300'
        )}
      >
        <div className="mb-2 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setSidebarTheme('default')}
            className={cn(
              'inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
              theme === 'default'
                ? 'bg-blue-700 text-white'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            )}
            aria-pressed={theme === 'default'}
          >
            <Sun className="h-3.5 w-3.5" />
            Default
          </button>
          <button
            type="button"
            onClick={() => setSidebarTheme('topbar-dark')}
            className={cn(
              'inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
              theme === 'topbar-dark'
                ? 'bg-amber-300/20 text-amber-200 ring-1 ring-amber-300/40'
                : 'bg-slate-700 text-slate-100 hover:bg-slate-600'
            )}
            aria-pressed={theme === 'topbar-dark'}
          >
            <Moon className="h-3.5 w-3.5" />
            Topbar Dark
          </button>
        </div>
      </div>
    </aside>
  );
}
