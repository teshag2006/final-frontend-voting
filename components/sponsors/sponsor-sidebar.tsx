'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Search, Settings, ScrollText } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/sponsors', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/sponsors/discover', label: 'Discover Contestants', icon: Search },
  { href: '/sponsors/campaigns', label: 'Campaigns', icon: ScrollText },
  { href: '/sponsors/settings', label: 'Profile Settings', icon: Settings },
];

export function SponsorSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col overflow-hidden border-r border-slate-300 bg-slate-100 pt-4">
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
                  ? 'bg-blue-700 text-white'
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
      <div className="border-t border-slate-300 p-3 text-center text-xs text-slate-500">Sponsor Portal</div>
    </aside>
  );
}
