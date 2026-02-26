'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const items = [
  { label: 'Overview', href: '/admin/content-management' },
  { label: 'Homepage', href: '/admin/content-management/homepage' },
  { label: 'Banners', href: '/admin/content-management/banners' },
  { label: 'Sliders', href: '/admin/content-management/sliders' },
  { label: 'Navigation', href: '/admin/content-management/navigation' },
  { label: 'Footer', href: '/admin/content-management/footer' },
];

export function ContentCmsNav() {
  const pathname = usePathname();

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
      <div className="flex flex-wrap gap-2">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'rounded-md px-3 py-2 text-sm transition',
                active
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

