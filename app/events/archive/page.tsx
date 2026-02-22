import { Metadata } from 'next';
import { EventCard } from '@/components/events/event-card';
import { mockArchivedEvents, mockEvents } from '@/lib/events-mock';
import { ArchiveFilterClient } from '@/components/events/archive-filter-client';

export const metadata: Metadata = {
  title: 'Event Archive | Voting Platform',
  description: 'Browse past voting events and view results from previous seasons.',
  openGraph: {
    title: 'Event Archive | Voting Platform',
    description: 'Browse past voting events and view results from previous seasons.',
  },
};

const allArchivedEvents = [
  ...mockArchivedEvents,
  ...mockEvents.filter((e) => e.status === 'ARCHIVED'),
];

export default function EventsArchivePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <section className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Event Archive
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Explore past voting events, view winners, and relive memorable moments from previous seasons.
          </p>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <ArchiveFilterClient events={allArchivedEvents} />
      </div>
    </main>
  );
}
