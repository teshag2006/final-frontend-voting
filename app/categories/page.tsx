import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { mockEvents } from '@/lib/events-mock';
import { Navbar } from '@/components/navbar';

export const metadata = {
  title: 'Events | Enterprise Voting Platform',
  description: 'Browse active and upcoming events.',
};

export default function CategoriesPage() {
  const activeAndUpcomingEvents = mockEvents.filter(
    (event) => event.status === 'LIVE' || event.status === 'UPCOMING'
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar variant="topbar-dark" />
      <main>
      <section className="border-b border-border bg-card/50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Events
          </h1>
          <p className="mt-3 max-w-3xl text-muted-foreground">
            Choose an event to explore categories and view contestants by segment.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {activeAndUpcomingEvents.map((event) => (
            <article
              key={event.id}
              className="rounded-xl border border-border bg-card p-5 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {event.status}
              </p>
              <h2 className="mt-2 text-xl font-semibold text-foreground">{event.name}</h2>
              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                {event.description}
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={`/events/${event.slug}/categories`}
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                >
                  View Categories
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href={`/events/${event.slug}`}
                  className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
                >
                  Event Details
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
      </main>
    </div>
  );
}
