'use client';

import React, { useState, useEffect } from 'react';
import { announcementService, Announcement } from '@/lib/services/announcementService';
import { useAuth } from '@/context/AuthContext';
import { X, AlertCircle, Info, CheckCircle, AlertTriangle } from 'lucide-react';

interface AnnouncementBannerProps {
  onClose?: () => void;
}

export function AnnouncementBanner({ onClose }: AnnouncementBannerProps) {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (user?.role) {
      const active = announcementService.getActiveAnnouncements(user.role as any);
      setAnnouncements(active);
    }
  }, [user?.role]);

  const handleDismiss = (id: string) => {
    const newDismissed = new Set(dismissedIds);
    newDismissed.add(id);
    setDismissedIds(newDismissed);
  };

  const visibleAnnouncements = announcements.filter((ann) => !dismissedIds.has(ann.id));

  if (visibleAnnouncements.length === 0) {
    return null;
  }

  const current = visibleAnnouncements[currentIndex] || visibleAnnouncements[0];

  const getIcon = () => {
    switch (current.type) {
      case 'error':
        return <AlertCircle className="h-5 w-5" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5" />;
      case 'success':
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getStyles = () => {
    switch (current.type) {
      case 'error':
        return 'bg-red-950 border-red-700 text-red-200';
      case 'warning':
        return 'bg-yellow-950 border-yellow-700 text-yellow-200';
      case 'success':
        return 'bg-green-950 border-green-700 text-green-200';
      case 'maintenance':
        return 'bg-purple-950 border-purple-700 text-purple-200';
      default:
        return 'bg-blue-950 border-blue-700 text-blue-200';
    }
  };

  return (
    <div className={`border-l-4 p-4 mb-4 flex items-start gap-4 ${getStyles()}`}>
      <div className="flex-shrink-0">
        {getIcon()}
      </div>
      
      <div className="flex-1">
        <h3 className="font-semibold mb-1">{current.title}</h3>
        <p className="text-sm opacity-90">{current.message}</p>
        
        {current.link && (
          <a
            href={current.link.url}
            className="text-sm font-medium mt-2 inline-block hover:underline"
          >
            {current.link.text} →
          </a>
        )}

        {visibleAnnouncements.length > 1 && (
          <div className="mt-2 flex items-center gap-2 text-xs">
            <span>
              {currentIndex + 1} of {visibleAnnouncements.length}
            </span>
            <button
              onClick={() => setCurrentIndex((i) => (i - 1 + visibleAnnouncements.length) % visibleAnnouncements.length)}
              className="px-2 py-1 hover:opacity-80"
            >
              ← Previous
            </button>
            <button
              onClick={() => setCurrentIndex((i) => (i + 1) % visibleAnnouncements.length)}
              className="px-2 py-1 hover:opacity-80"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {current.isDismissible && (
        <button
          onClick={() => handleDismiss(current.id)}
          className="flex-shrink-0 hover:opacity-80"
          aria-label="Close announcement"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
