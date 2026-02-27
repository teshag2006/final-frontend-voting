import Link from 'next/link';
import { LEADERBOARD_CONTESTANTS } from '@/lib/public-pages-mock';

export const metadata = {
  title: 'Contestants | Enterprise Voting Platform',
  description: 'Discover verified contestants and open their voting profiles.',
};

export default function ContestantsPage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="border-b border-border bg-card/50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Contestants
          </h1>
          <p className="mt-3 max-w-3xl text-muted-foreground">
            Browse featured contestants, compare rankings, and open their profile to vote.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {LEADERBOARD_CONTESTANTS.map((contestant) => (
            <article
              key={contestant.id}
              className="rounded-xl border border-border bg-card p-5 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Rank #{contestant.rank}
              </p>
              <h2 className="mt-2 text-xl font-semibold text-foreground">{contestant.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {contestant.country} • {contestant.category_name}
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {contestant.total_votes.toLocaleString()} votes
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={`/events/${contestant.event_slug}/contestant/${contestant.slug}`}
                  className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Open Profile
                </Link>
                <Link
                  href={`/events/${contestant.event_slug}/contestant/${contestant.slug}/vote`}
                  className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
                >
                  Vote Now
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
