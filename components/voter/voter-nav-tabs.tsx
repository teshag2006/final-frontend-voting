'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, CreditCard, Vote, Settings } from 'lucide-react';

export function VoterNavTabs() {
  const pathname = usePathname();

  const tabs = [
    {
      name: 'Dashboard',
      href: '/voter/dashboard',
      icon: LayoutDashboard,
      active: pathname === '/voter/dashboard',
    },
    {
      name: 'My Votes',
      href: '/voter/my-votes',
      icon: Vote,
      active: pathname === '/voter/my-votes',
    },
    {
      name: 'Payments',
      href: '/voter/payments',
      icon: CreditCard,
      active: pathname === '/voter/payments',
    },
    {
      name: 'Settings',
      href: '/voter/settings',
      icon: Settings,
      active: pathname === '/voter/settings',
    },
  ];

  return (
    <div className="border-b border-border bg-card/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Link key={tab.href} href={tab.href}>
                <Button
                  variant={tab.active ? 'default' : 'ghost'}
                  size="sm"
                  className="gap-2 whitespace-nowrap"
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.name}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
