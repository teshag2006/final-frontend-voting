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
    <aside className="h-fit rounded-xl border border-slate-200 bg-white p-3 shadow-sm lg:sticky lg:top-24">
      <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Navigation</p>
      <nav className="space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'block rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
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
