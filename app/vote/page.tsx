import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { mockEvents } from '@/lib/events-mock';

export const metadata = {
  title: 'Start Voting | Enterprise Voting Platform',
  description: 'Pick a live event and start secure, verified voting.',
};

export default function VotePage() {
  const liveEvents = mockEvents.filter((event) => event.status === 'LIVE' || event.is_live);

  return (
    <main className="min-h-screen bg-background">
      <section className="border-b border-border bg-card/50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Start Voting
          </h1>
          <p className="mt-3 max-w-3xl text-muted-foreground">
            Select a live event to continue to categories, contestant profiles, and voting.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {liveEvents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
            <p className="text-lg font-medium text-foreground">No live events right now</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Check upcoming events and return when voting opens.
            </p>
            <Link
              href="/events"
              className="mt-5 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {liveEvents.map((event) => (
              <article
                key={event.id}
                className="rounded-xl border border-border bg-card p-5 shadow-sm"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                  Live
                </p>
                <h2 className="mt-2 text-xl font-semibold text-foreground">{event.name}</h2>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                  {event.description}
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                  Vote Price: ${event.vote_price} per vote
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href={`/events/${event.slug}`}
                    className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    Open Event
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`/leaderboard/${event.id}`}
                    className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
                  >
                    View Leaderboard
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
