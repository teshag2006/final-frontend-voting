import { Metadata } from 'next';
import Link from 'next/link';
import { EventCard } from '@/components/events/event-card';
import { Button } from '@/components/ui/button';
import { mockEvents } from '@/lib/events-mock';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'All Events | Voting Platform',
  description: 'Explore all live, upcoming, and archived voting events. Participate in African beauty pageants, talent shows, and more.',
  openGraph: {
    title: 'All Events | Voting Platform',
    description: 'Explore all live, upcoming, and archived voting events.',
    type: 'website',
  },
};

export default function EventsPage() {
  const liveEvents = mockEvents.filter((e) => e.status === 'LIVE' || e.status === 'active');
  const upcomingEvents = mockEvents.filter((e) => e.status === 'UPCOMING' || e.status === 'coming_soon');
  const archivedEvents = mockEvents.filter((e) => e.status === 'ARCHIVED' || e.status === 'cancelled');

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <section className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Voting Events
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Discover and participate in our platform's most exciting voting events. From beauty pageants to talent shows, your vote matters.
          </p>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16 space-y-16">
        {/* Live Events */}
        {liveEvents.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <span className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />
                  Live Events
                </h2>
                <p className="text-gray-600 mt-2">Voting is active now</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <section>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Upcoming Events</h2>
              <p className="text-gray-600">Get ready to vote when these events go live</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        )}

        {/* Archived Events */}
        {archivedEvents.length > 0 && (
          <section>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Past Events</h2>
              <p className="text-gray-600">View results and winners from previous events</p>
              <Link href="/events/archive" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mt-4">
                View Complete Archive
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {archivedEvents.slice(0, 3).map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {liveEvents.length === 0 && upcomingEvents.length === 0 && archivedEvents.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No Events Available</h3>
            <p className="text-gray-600 mb-8">Check back soon for upcoming voting events.</p>
            <Link href="/">
              <Button className="bg-blue-600 hover:bg-blue-700">Return Home</Button>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
