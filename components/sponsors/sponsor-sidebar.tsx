'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/sponsors', label: 'Dashboard' },
  { href: '/sponsors/discover', label: 'Discover Contestants' },
  { href: '/sponsors/settings', label: 'Profile Settings' },
];

export function SponsorSidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-fit p-3 text-slate-100 lg:sticky lg:top-28">
      <p className="px-2 pb-3 pt-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">Navigation</p>
      <nav className="space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'block rounded-md border-l-2 px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'border-l-amber-300 bg-blue-900/70 text-white'
                  : 'border-l-transparent text-slate-200 hover:bg-white/10 hover:text-white'
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
