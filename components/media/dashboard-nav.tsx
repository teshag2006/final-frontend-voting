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
    <nav className="space-y-1 p-2">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

        return (
          <Link key={item.href} href={item.href}>
            <Button
              variant={isActive ? 'default' : 'ghost'}
              className={cn(
                'w-full justify-start gap-2 rounded-lg px-2 py-2',
                isActive
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )}
              onClick={() => setOpen(false)}
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm">{item.label}</span>
            </Button>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      <aside className="hidden w-52 shrink-0 border-r border-slate-800 bg-slate-900/70 md:block">
        <div className="sticky top-[73px] h-[calc(100vh-73px)] overflow-y-auto">
          <div className="px-3 pt-3">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Media Navigation</p>
          </div>
          <NavContent />
        </div>
      </aside>

      {/* Mobile Navigation */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="fixed bottom-4 left-4 z-30 md:hidden">
          <Button 
            variant="default" 
            size="icon" 
            className="h-11 w-11 rounded-full bg-blue-600 text-white hover:bg-blue-700"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="border-slate-800 bg-slate-900 p-0">
          <div className="border-b border-slate-800 px-4 py-3">
            <p className="text-sm font-semibold text-white">Media Navigation</p>
          </div>
          <NavContent />
        </SheetContent>
      </Sheet>
    </>
  );
}
