'use client';

import Link from 'next/link';
import { Bell } from 'lucide-react';
import { useState, useEffect } from 'react';

export function NotificationBadge() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let mounted = true;

    const loadUnreadCount = async () => {
      try {
        const response = await fetch('/api/contestant/notifications/unread-count', {
          method: 'GET',
          cache: 'no-store',
          credentials: 'same-origin',
        });
        if (!response.ok) return;

        const payload = (await response.json()) as
          | { unreadCount?: number; data?: { unreadCount?: number } }
          | null;
        const count = Number(payload?.unreadCount ?? payload?.data?.unreadCount ?? 0);
        if (mounted) {
          setUnreadCount(Number.isFinite(count) ? Math.max(0, count) : 0);
        }
      } catch {
        if (mounted) {
          setUnreadCount(0);
        }
      }
    };

    void loadUnreadCount();
    const interval = setInterval(() => {
      void loadUnreadCount();
    }, 30000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <Link href="/notifications" className="relative">
      <button className="p-2 text-slate-400 hover:text-white transition rounded-lg hover:bg-slate-700/50">
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
    </Link>
  );
}
