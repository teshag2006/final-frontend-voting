'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  TrendingUp,
  BarChart3,
  DollarSign,
  Shield,
  Globe,
  Handshake,
  Calendar,
  Bell,
} from 'lucide-react';

export function DashboardNavTabs() {
  const pathname = usePathname();

  const tabs = [
    {
      name: 'Overview',
      href: '/events/contestant/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Ranking',
      href: '/events/contestant/ranking',
      icon: TrendingUp,
    },
    {
      name: 'Analytics',
      href: '/events/contestant/analytics',
      icon: BarChart3,
    },
    {
      name: 'Revenue',
      href: '/events/contestant/revenue',
      icon: DollarSign,
    },
    {
      name: 'Security',
      href: '/events/contestant/security',
      icon: Shield,
    },
    {
      name: 'Geographic',
      href: '/events/contestant/geographic',
      icon: Globe,
    },
    {
      name: 'Sponsors',
      href: '/events/contestant/sponsors',
      icon: Handshake,
    },
    {
      name: 'Event',
      href: '/events/contestant/event',
      icon: Calendar,
    },
    {
      name: 'Notifications',
      href: '/events/contestant/notifications',
      icon: Bell,
    },
  ];

  return (
    <div className="border-b border-border bg-card/50 sticky top-0 z-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname === tab.href;
            return (
              <Link key={tab.href} href={tab.href}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
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
