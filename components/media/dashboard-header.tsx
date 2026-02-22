'use client';

import Link from 'next/link';
import { ChevronDown, LogOut, Settings } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

const topNavItems = [
  { label: 'Dashboard', href: '/media/dashboard' },
  { label: 'Leaderboard', href: '/media/leaderboard' },
  { label: 'Geographic', href: '/media/geographic' },
  { label: 'Fraud Center', href: '/media/fraud' },
  { label: 'Blockchain', href: '/media/blockchain' },
  { label: 'Exports', href: '/media/exports' },
  { label: 'Notifications', href: '/media/notifications' },
];

export function MediaDashboardHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <h1 className="whitespace-nowrap text-2xl font-bold text-gray-900">Media Dashboard</h1>
          <nav className="hidden xl:flex flex-wrap gap-2">
            {topNavItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'h-8 rounded-md px-3 text-sm',
                      isActive
                        ? 'bg-blue-600 text-white hover:bg-blue-700 hover:text-white'
                        : 'text-slate-700 hover:bg-slate-200'
                    )}
                  >
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-10 flex items-center gap-2 px-2 hover:bg-gray-100">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Hana%20Tesfaye" />
                  <AvatarFallback className="bg-blue-600 text-white text-xs">MU</AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline text-sm font-medium text-gray-700">MediaUser</span>
                <ChevronDown className="h-4 w-4 text-gray-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-gray-200 bg-white">
              <DropdownMenuItem disabled className="text-gray-500 text-xs cursor-default">
                media@example.com
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-gray-700 hover:bg-gray-50 cursor-pointer"
                onClick={() => router.push('/profile/settings')}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="text-gray-700 hover:bg-gray-50 cursor-pointer" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="border-t border-gray-100 bg-gray-50/80 px-4 py-2 xl:hidden md:px-8">
        <nav className="flex flex-wrap gap-2">
          {topNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'h-8 rounded-md px-3 text-sm',
                    isActive
                      ? 'bg-blue-600 text-white hover:bg-blue-700 hover:text-white'
                      : 'text-slate-700 hover:bg-slate-200'
                  )}
                >
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

