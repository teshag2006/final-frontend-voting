'use client';

import Link from 'next/link';
import { Event } from '@/types/event';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Edit, Eye, TrendingUp } from 'lucide-react';

interface AdminEventsListProps {
  events: Event[];
}

export function AdminEventsList({ events }: AdminEventsListProps) {
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

  if (events.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground mb-4">No events found</p>
        <Button asChild>
          <Link href="/admin/events/new">Create New Event</Link>
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <Card key={event.id} className="p-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Event Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h3 className="text-lg font-semibold text-foreground">{event.name}</h3>
                <Badge className={getStatusColor(event.status)}>
                  {event.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {event.description}
              </p>
              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground flex-wrap">
                <span>Season {event.season_year || new Date().getFullYear()}</span>
                {event.location && <span>{event.location}</span>}
                <span>${event.vote_price}/vote</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/events/${event.slug}`} className="gap-2">
                  <Eye className="h-4 w-4" />
                  <span className="hidden sm:inline">View</span>
                </Link>
              </Button>

              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/events/${event.slug}/analytics`} className="gap-2">
                  <TrendingUp className="h-4 w-4" />
                  <span className="hidden sm:inline">Analytics</span>
                </Link>
              </Button>

              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/events/${event.slug}/edit`} className="gap-2">
                  <Edit className="h-4 w-4" />
                  <span className="hidden sm:inline">Edit</span>
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
