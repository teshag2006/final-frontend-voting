import Link from 'next/link';
import { Event } from '@/types/event';
import { EventCard } from './event-card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface UpcomingEventsGridProps {
  events: Event[];
  limit?: number;
  showViewAll?: boolean;
}

export function UpcomingEventsGrid({
  events,
  limit = 3,
  showViewAll = true,
}: UpcomingEventsGridProps) {
  const upcomingEvents = events.filter(
    (e) => e.status === 'UPCOMING' || e.status === 'coming_soon'
  );

  if (upcomingEvents.length === 0) {
    return null;
  }

  const displayEvents = limit ? upcomingEvents.slice(0, limit) : upcomingEvents;

  return (
    <section className="py-12 md:py-16">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Upcoming Events</h2>
            <p className="text-muted-foreground">
              Get ready! These events are coming soon. Set reminders to vote when they go live.
            </p>
          </div>
          {showViewAll && upcomingEvents.length > limit && (
            <Button variant="outline" asChild className="hidden sm:flex">
              <Link href="/events">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>

        {showViewAll && upcomingEvents.length > limit && (
          <div className="flex sm:hidden">
            <Button variant="outline" asChild className="w-full">
              <Link href="/events">
                View All Events <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
