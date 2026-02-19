'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CreditCard, LayoutDashboard, Settings, Vote } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/voter/dashboard', icon: LayoutDashboard },
  { name: 'My Votes', href: '/voter/my-votes', icon: Vote },
  { name: 'Payments', href: '/voter/payments', icon: CreditCard },
  { name: 'Settings', href: '/voter/settings', icon: Settings },
];

export function VoterSidebarNav() {
  const pathname = usePathname();

  return (
    <>
      <aside className="hidden h-fit rounded-2xl border border-slate-200 bg-white p-3 shadow-sm lg:block">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="lg:hidden">
        <nav className="flex gap-2 overflow-x-auto rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
