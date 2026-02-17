'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import type { Event } from '@/types/event';
import { Badge } from '@/components/ui/badge';

interface EventSelectorProps {
  events: Event[];
  activeEventSlug?: string;
  onEventChange?: (eventSlug: string) => void;
}

export function EventSelector({
  events,
  activeEventSlug,
  onEventChange,
}: EventSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const activeEvent = events.find((e) => e.slug === activeEventSlug) || events[0];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'LIVE':
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'UPCOMING':
      case 'coming_soon':
        return 'bg-blue-100 text-blue-800';
      case 'CLOSED':
        return 'bg-orange-100 text-orange-800';
      case 'ARCHIVED':
        return 'bg-slate-100 text-slate-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'LIVE':
      case 'active':
        return 'LIVE';
      case 'UPCOMING':
      case 'coming_soon':
        return 'UPCOMING';
      case 'CLOSED':
        return 'CLOSED';
      case 'ARCHIVED':
        return 'ARCHIVED';
      default:
        return status;
    }
  };

  if (events.length <= 1) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
      >
        <div className="flex flex-col items-start">
          <span className="text-xs text-muted-foreground">Event:</span>
          <span className="font-semibold">{activeEvent.name}</span>
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-lg border border-border bg-card shadow-lg">
            <div className="p-3 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Select Event</h3>
            </div>

            <div className="max-h-96 overflow-y-auto p-2 space-y-1">
              {events.map((event) => (
                <button
                  key={event.id}
                  onClick={() => {
                    setIsOpen(false);
                    onEventChange?.(event.slug);
                  }}
                  className={`w-full flex items-start justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    event.slug === activeEventSlug
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground hover:bg-secondary'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{event.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {event.season_year || new Date().getFullYear()}
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`shrink-0 ${getStatusColor(event.status)}`}
                  >
                    {getStatusLabel(event.status)}
                  </Badge>
                </button>
              ))}
            </div>

            <div className="border-t border-border p-2">
              <Link
                href="/events"
                className="block w-full rounded-lg px-3 py-2 text-center text-sm text-primary hover:bg-primary/10 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                View all events
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
