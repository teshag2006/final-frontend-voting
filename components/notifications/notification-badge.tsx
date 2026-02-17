'use client';

import Link from 'next/link';
import { Bell } from 'lucide-react';
import { useState, useEffect } from 'react';

export function NotificationBadge() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Simulate fetching unread notification count
    // In production, this would be fetched from backend
    const mockCount = Math.floor(Math.random() * 5);
    setUnreadCount(mockCount);

    // Simulate real-time updates
    const interval = setInterval(() => {
      setUnreadCount((prev) => (prev > 0 ? prev - 1 : 0));
    }, 10000);

    return () => clearInterval(interval);
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
