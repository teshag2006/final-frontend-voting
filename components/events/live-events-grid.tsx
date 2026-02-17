import Link from 'next/link';
import { Event } from '@/types/event';
import { EventCard } from './event-card';
import { Button } from '@/components/ui/button';

interface LiveEventsGridProps {
  events: Event[];
  featured?: boolean;
}

export function LiveEventsGrid({ events, featured = false }: LiveEventsGridProps) {
  const liveEvents = events.filter(
    (e) => e.status === 'LIVE' || e.status === 'active'
  );

  if (liveEvents.length === 0) {
    return null;
  }

  // If featured mode, show the first event full-width, rest in grid
  if (featured && liveEvents.length > 0) {
    const [featuredEvent, ...otherEvents] = liveEvents;

    return (
      <section className="py-12 md:py-16 space-y-12">
        {/* Featured Event */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <span className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />
            <h2 className="text-3xl font-bold text-foreground">Live Events</h2>
            <span className="text-sm text-muted-foreground ml-2">
              Voting is active now
            </span>
          </div>
          <EventCard event={featuredEvent} featured />
        </div>

        {/* Other Live Events */}
        {otherEvents.length > 0 && (
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-6">
              More Active Events
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}
      </section>
    );
  }

  // Standard grid layout
  return (
    <section className="py-12 md:py-16">
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <span className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />
          <h2 className="text-3xl font-bold text-foreground">Live Events</h2>
          <span className="text-sm text-muted-foreground">
            Voting is active now
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {liveEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </section>
  );
}
