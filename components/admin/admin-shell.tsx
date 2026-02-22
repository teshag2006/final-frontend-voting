'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ComponentType, ReactNode, useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Activity,
  AlertTriangle,
  Annoyed,
  Bell,
  Blocks,
  Bug,
  ChevronRight,
  CreditCard,
  Flag,
  Gauge,
  LayoutDashboard,
  ListChecks,
  Menu,
  Megaphone,
  Moon,
  ReceiptText,
  Settings,
  Shield,
  ShieldAlert,
  SlidersHorizontal,
  Sun,
  Handshake,
  ClipboardCheck,
  Users,
  UserSquare2,
  Vote,
  Workflow,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminShellProps {
  children: ReactNode;
}

type AdminTheme = 'dark' | 'light';

interface NavItem {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: 'Control Center',
    items: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
      { label: 'Enhanced View', href: '/admin/dashboard-enhanced', icon: Gauge },
      { label: 'Analytics', href: '/admin/analytics', icon: Activity },
      { label: 'Reports', href: '/admin/reports', icon: ReceiptText },
    ],
  },
  {
    title: 'Voting Ops',
    items: [
      { label: 'Events', href: '/admin/events', icon: ListChecks },
      { label: 'Categories', href: '/admin/categories', icon: SlidersHorizontal },
      { label: 'Contestants', href: '/admin/contestants', icon: UserSquare2 },
      { label: 'Registration Review', href: '/admin/registration-review', icon: ClipboardCheck },
      { label: 'Sponsors', href: '/admin/sponsors', icon: Handshake },
      { label: 'Votes', href: '/admin/votes', icon: Vote },
      { label: 'Payments', href: '/admin/payments', icon: CreditCard },
      { label: 'Users & Roles', href: '/admin/users', icon: Users },
    ],
  },
  {
    title: 'Risk & Infra',
    items: [
      { label: 'Fraud', href: '/admin/fraud', icon: Shield },
      { label: 'Audit Logs', href: '/admin/audit-logs', icon: Bug },
      { label: 'Blockchain', href: '/admin/blockchain', icon: Blocks },
      { label: 'Cache', href: '/admin/cache', icon: Workflow },
      { label: 'Health', href: '/admin/health', icon: Activity },
      { label: 'Health Check', href: '/admin/health-check', icon: ShieldAlert },
      { label: 'Jobs Queue', href: '/admin/jobs', icon: Workflow },
    ],
  },
  {
    title: 'Governance',
    items: [
      { label: 'Notifications', href: '/admin/notifications', icon: Bell },
      { label: 'Announcements', href: '/admin/announcements', icon: Megaphone },
      { label: 'Feature Flags', href: '/admin/feature-flags', icon: Flag },
      { label: 'Moderation', href: '/admin/moderation', icon: AlertTriangle },
      { label: 'Emergency', href: '/admin/emergency-controls', icon: Annoyed },
      { label: 'Settings', href: '/admin/settings', icon: Settings },
    ],
  },
];

function isItemActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  return pathname.startsWith(`${href}/`);
}

function SidebarNav({
  pathname,
  theme,
  onToggleTheme,
}: {
  pathname: string;
  theme: AdminTheme;
  onToggleTheme: () => void;
}) {
  const isDark = theme === 'dark';

  return (
    <div className="flex h-full flex-col">
      <div className={cn('px-5 py-5', isDark ? 'border-b border-white/10' : 'border-b border-slate-200')}>
        <Link href="/admin/dashboard" className="group block">
          <div className="rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 p-[1px] shadow-lg shadow-blue-900/40 transition group-hover:shadow-cyan-700/40">
            <div className={cn('rounded-[11px] px-4 py-3', isDark ? 'bg-slate-950/95' : 'bg-white')}>
              <p className={cn('text-xs uppercase tracking-[0.18em]', isDark ? 'text-cyan-300/90' : 'text-cyan-700')}>
                Admin
              </p>
              <p className={cn('mt-1 text-sm font-semibold', isDark ? 'text-white' : 'text-slate-900')}>
                Operations Console
              </p>
            </div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-5">
        {navGroups.map((group) => (
          <div key={group.title}>
            <p
              className={cn(
                'mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.14em]',
                isDark ? 'text-slate-400' : 'text-slate-500'
              )}
            >
              {group.title}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = isItemActive(pathname, item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'group/item relative flex items-center gap-3 overflow-hidden rounded-lg px-3 py-2.5 text-sm transition-all',
                      active
                        ? isDark
                          ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-100 shadow-inner shadow-cyan-700/10'
                          : 'bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-900 shadow-inner'
                        : isDark
                          ? 'text-slate-300 hover:bg-white/5 hover:text-white'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-4 w-4 transition-transform duration-200 group-hover/item:scale-110',
                        active ? (isDark ? 'text-cyan-300' : 'text-cyan-700') : isDark ? 'text-slate-400' : 'text-slate-500'
                      )}
                    />
                    <span className="flex-1">{item.label}</span>
                    <ChevronRight
                      className={cn(
                        'h-3.5 w-3.5 transition-all',
                        active
                          ? `translate-x-0 ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`
                          : '-translate-x-1 opacity-0 group-hover/item:translate-x-0 group-hover/item:opacity-100'
                      )}
                    />
                    {active && (
                      <span className={cn('absolute inset-y-1 left-0 w-0.5 rounded-r', isDark ? 'bg-cyan-300' : 'bg-cyan-700')} />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className={cn('px-5 py-4', isDark ? 'border-t border-white/10 text-slate-400' : 'border-t border-slate-200 text-slate-600')}>
        <button
          type="button"
          onClick={onToggleTheme}
          className={cn(
            'mb-3 flex w-full items-center justify-between rounded-lg border px-3 py-2 text-xs font-medium transition',
            isDark ? 'border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
          )}
        >
          <span>{isDark ? 'Dark theme' : 'Light theme'}</span>
          {isDark ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
        </button>
        <p>Secure voting command center</p>
      </div>
    </div>
  );
}

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<AdminTheme>('dark');
  const isDark = theme === 'dark';

  useEffect(() => {
    const stored = localStorage.getItem('admin_theme');
    if (stored === 'dark' || stored === 'light') {
      setTheme(stored);
    }
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('admin_theme', next);
      return next;
    });
  };

  return (
    <div className={cn('min-h-screen', isDark ? 'bg-slate-100' : 'bg-slate-50')}>
      <div
        className={cn(
          'fixed inset-0 -z-10',
          isDark
            ? 'bg-[radial-gradient(1200px_600px_at_0%_0%,rgba(56,189,248,0.16),transparent_60%),radial-gradient(800px_400px_at_100%_100%,rgba(14,165,233,0.14),transparent_60%)]'
            : 'bg-[radial-gradient(1200px_600px_at_0%_0%,rgba(14,165,233,0.10),transparent_60%),radial-gradient(800px_400px_at_100%_100%,rgba(56,189,248,0.08),transparent_60%)]'
        )}
      />

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 hidden w-72 border-r lg:block',
          isDark ? 'border-white/10 bg-slate-950' : 'border-slate-200 bg-white'
        )}
      >
        <SidebarNav pathname={pathname} theme={theme} onToggleTheme={toggleTheme} />
      </aside>

      <div className="lg:pl-72">
        <div className="fixed left-3 top-3 z-40 lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-900 shadow-sm"
                aria-label="Open admin menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className={cn('w-80 p-0', isDark ? 'border-white/10 bg-slate-950' : 'border-slate-200 bg-white')}
            >
              <SidebarNav pathname={pathname} theme={theme} onToggleTheme={toggleTheme} />
            </SheetContent>
          </Sheet>
        </div>

        <div className="min-h-screen">{children}</div>
      </div>
    </div>
  );
}
