'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  List,
  Globe,
  AlertTriangle,
  Blocks,
  FileText,
  Bell,
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useState } from 'react';

const navigationItems = [
  {
    label: 'Dashboard',
    href: '/media/dashboard',
    icon: BarChart3,
  },
  {
    label: 'Leaderboard',
    href: '/media/leaderboard',
    icon: List,
  },
  {
    label: 'Geographic',
    href: '/media/geographic',
    icon: Globe,
  },
  {
    label: 'Fraud Center',
    href: '/media/fraud',
    icon: AlertTriangle,
  },
  {
    label: 'Blockchain',
    href: '/media/blockchain',
    icon: Blocks,
  },
  {
    label: 'Exports',
    href: '/media/exports',
    icon: FileText,
  },
  {
    label: 'Notifications',
    href: '/media/notifications',
    icon: Bell,
  },
];

export function MediaDashboardNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const NavContent = () => (
    <nav className="space-y-1">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

        return (
          <Link key={item.href} href={item.href}>
            <Button
              variant={isActive ? 'default' : 'ghost'}
              className={cn(
                'w-full justify-start gap-3',
                isActive
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
              onClick={() => setOpen(false)}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{item.label}</span>
            </Button>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden border-b border-gray-200 bg-white md:block">
        <div className="flex items-center overflow-x-auto px-4 md:px-8">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <Link key={item.href} href={item.href} className="relative">
                <Button
                  variant="ghost"
                  className={cn(
                    'gap-2 rounded-none border-b-2 px-3 py-4 text-sm font-medium',
                    isActive
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden lg:inline">{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mobile Navigation */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="md:hidden">
          <Button 
            variant="ghost" 
            size="icon" 
            className="border-b border-gray-200 text-gray-700 hover:bg-gray-100"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="border-gray-200 bg-white">
          <NavContent />
        </SheetContent>
      </Sheet>
    </>
  );
}
