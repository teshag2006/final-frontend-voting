import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2, Clock3, ShieldCheck, ShieldAlert, BarChart3 } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { EventCountdown } from '@/components/events/event-countdown';
import { CategoriesControls } from '@/components/category/categories-controls';
import { getEventBySlug, getCategoriesForEvent, getContestantsForEvent } from '@/lib/mock-data-generator';

export const dynamic = 'force-dynamic';

type SortKey = 'votes_desc' | 'votes_asc';
const ALLOWED_SORTS: SortKey[] = ['votes_desc', 'votes_asc'];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ eventSlug: string }>;
}): Promise<Metadata> {
  const { eventSlug } = await params;
  const event = getEventBySlug(eventSlug);

  return {
    title: `${event?.name || 'Event'} Categories | Vote Online`,
    description: `Explore category leaders and ranked contestants in ${event?.name || 'this event'}.`,
    alternates: {
      canonical: `/events/${eventSlug}/categories`,
    },
  };
}

function formatVotes(votes: number): string {
  return votes.toLocaleString();
}

export default async function CategoriesPage({
  params,
  searchParams,
}: {
  params: Promise<{ eventSlug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { eventSlug } = await params;
  const rawSearch = (await searchParams) || {};
  const event = getEventBySlug(eventSlug);
  const categories = getCategoriesForEvent(eventSlug);
  const contestants = getContestantsForEvent(eventSlug);

  if (!event) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <h1 className="text-2xl font-bold">Event not found</h1>
      </div>
    );
  }

  const readParam = (value: string | string[] | undefined, fallback: string) => {
    if (Array.isArray(value)) return String(value[0] || fallback);
    if (typeof value === 'string') return value;
    return fallback;
  };

  const currentCategorySlug = readParam(rawSearch.category, 'all');
  const requestedSort = readParam(rawSearch.sort, 'votes_desc');
  const currentSort: SortKey = ALLOWED_SORTS.includes(requestedSort as SortKey)
    ? (requestedSort as SortKey)
    : 'votes_desc';
  const currentCountry = readParam(rawSearch.country, 'all');
  const currentSearch = readParam(rawSearch.q, '').trim();
  const selectedCategory =
    currentCategorySlug === 'all'
      ? null
      : categories.find((item) => item.slug === currentCategorySlug) || null;

  const countryOptions = Array.from(
    new Set(
      contestants
        .map((contestant) => (contestant as { country?: string }).country || 'N/A')
        .filter((country) => country !== 'N/A')
    )
  ).sort((a, b) => a.localeCompare(b));

  const visibleContestants = contestants.filter((contestant) => {
    if (currentSearch) {
      const haystack = `${String(contestant.name || '')} ${String(contestant.category || '')}`.toLowerCase();
      if (!haystack.includes(currentSearch.toLowerCase())) return false;
    }
    if (!selectedCategory) return true;
    const categoryMatch =
      String(contestant.category || '').toLowerCase() === String(selectedCategory.name || '').toLowerCase();
    if (!categoryMatch) return false;
    if (currentCountry === 'all') return true;
    return String((contestant as { country?: string }).country || 'N/A') === currentCountry;
  });

  const visibleContestantsWithCountry = selectedCategory
    ? visibleContestants
    : visibleContestants.filter((contestant) => {
        if (currentCountry === 'all') return true;
        return String((contestant as { country?: string }).country || 'N/A') === currentCountry;
      });

  const withScopedRank = visibleContestantsWithCountry
    .map((contestant) => ({
      ...contestant,
      votesNumber: Number(contestant.votes || 0),
      country: (contestant as { country?: string }).country || 'N/A',
    }))
    .sort((a, b) => b.votesNumber - a.votesNumber)
    .map((contestant, index) => ({
      ...contestant,
      scopedRank: index + 1,
    }));

  const rankedContestants = [...withScopedRank].sort((a, b) => {
    if (currentSort === 'votes_asc') return a.votesNumber - b.votesNumber;
    return b.votesNumber - a.votesNumber;
  });

  const leader = rankedContestants[0] || null;
  const totalVotes = rankedContestants.reduce((sum, item) => sum + item.votesNumber, 0);
  const activeCountries = new Set(
    rankedContestants.map((item) => String(item.country || 'N/A')).filter((country) => country !== 'N/A')
  ).size;
  const isLive = event.status === 'LIVE' || event.status === 'active';
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_10%_0%,#f4f2ff_0%,#f8f8fc_35%,#f4f5fb_100%)]">
      <Navbar />

      <main className="mx-auto max-w-[1500px] px-4 pb-14 pt-8 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/80 shadow-[0_30px_80px_-45px_rgba(35,42,92,0.45)] backdrop-blur">
          <div className="border-b border-slate-200/80 px-5 py-4 sm:px-8">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{event.name} Rankings</h1>
                <p className="mt-1 text-sm text-slate-500">
                  Category-first leaderboard, verified vote totals, and real-time status cards.
                </p>
              </div>
              <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
                <span className="mr-2 text-slate-500">Total Votes</span>
                <span className="text-2xl font-semibold text-slate-900">{formatVotes(totalVotes)}</span>
              </div>
            </div>
          </div>

          <div className="border-b border-slate-200/80 px-5 py-4 sm:px-8">
            <CategoriesControls
              eventSlug={eventSlug}
              currentSort={currentSort}
              currentCategorySlug={currentCategorySlug}
              currentCountry={currentCountry}
              currentSearch={currentSearch}
              categories={categories.map((category) => ({ slug: category.slug, name: category.name }))}
              countryOptions={countryOptions}
            />
          </div>

          <div className="grid gap-6 p-5 sm:p-8 lg:grid-cols-[1fr_360px]">
            <section className="space-y-4">
              {leader ? (
                <article className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-[#f4efff] via-[#eef5ff] to-[#f8f4ff] shadow-sm">
                  <div className="grid gap-0 sm:grid-cols-[280px_1fr]">
                    <div className="relative min-h-[190px]">
                      <Image
                        src={leader.image_url}
                        alt={leader.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 280px"
                      />
                      <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xl font-bold text-emerald-600">
                        #{leader.scopedRank}
                      </div>
                    </div>
                    <div className="flex flex-col justify-center px-5 py-5 sm:px-7">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-4xl font-semibold tracking-tight text-slate-900">{leader.name}</h2>
                        <CheckCircle2 className="h-7 w-7 text-emerald-500" />
                        <span className="rounded-full bg-white/70 px-3 py-1 text-sm font-medium text-slate-700">
                          {leader.category}
                        </span>
                      </div>
                      <p className="mt-2 text-lg text-slate-600">Verified Contestant</p>
                      <p className="mt-1 text-5xl font-semibold text-slate-900">{formatVotes(leader.votesNumber)}</p>
                      <p className="text-sm uppercase tracking-wider text-slate-500">votes</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-5 border-t border-slate-200/80 bg-white/60 px-4 py-3 text-sm text-slate-700">
                    <span className="inline-flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      Blockchain Secured
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 text-rose-600" />
                      Fraud Detection Enabled
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-blue-600" />
                      Real-Time Leaderboard
                    </span>
                  </div>
                </article>
              ) : null}

              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                {rankedContestants.map((contestant) => (
                  <article
                    key={contestant.id}
                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="relative aspect-[3/4]">
                      <Image
                        src={contestant.image_url}
                        alt={contestant.name}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                      />
                      <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border border-white/50 bg-white/25 px-3 py-1 text-sm font-semibold text-white backdrop-blur-md">
                        <span className="opacity-80">Rank</span>
                        <span>{contestant.scopedRank}</span>
                      </div>
                    </div>
                    <div className="border-t border-slate-200 bg-white px-3 py-3">
                      <div className="space-y-1">
                        <p className="truncate text-xl font-semibold leading-tight text-slate-900">{contestant.name}</p>
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-700">
                            {contestant.category}
                          </span>
                          <span className="text-slate-500">{contestant.country || 'N/A'}</span>
                        </div>
                        <p className="text-sm font-medium text-slate-600">
                          {formatVotes(contestant.votesNumber)} votes
                        </p>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <Link
                          href={`/events/${eventSlug}/contestant/${contestant.slug || contestant.id}`}
                          className="rounded-lg bg-blue-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <aside className="space-y-4">
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-2xl font-semibold text-slate-900">Live Statistics</h3>
                <div className="mt-4 space-y-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Total Votes</p>
                    <p className="text-5xl font-semibold text-slate-900">{formatVotes(totalVotes)}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Active Countries</p>
                    <p className="text-5xl font-semibold text-slate-900">{activeCountries}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Integrity Status</p>
                    <p className="text-3xl font-semibold text-slate-900">Protected</p>
                    <p className="mt-2 text-xs text-slate-500">Security monitoring is active.</p>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-xl font-semibold text-slate-900">Event Window</h3>
                <div className="mt-3">
                  <EventCountdown
                    startDate={event.start_date}
                    endDate={event.end_date}
                    eventStatus={event.status}
                  />
                </div>
                <div className="mt-4 space-y-3 border-t border-slate-200 pt-4 text-sm text-slate-700">
                  <p className="inline-flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    Blockchain Secured
                  </p>
                  <p className="inline-flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-rose-600" />
                    Fraud Detection Enabled
                  </p>
                  <p className="inline-flex items-center gap-2">
                    <Clock3 className="h-4 w-4 text-blue-600" />
                    Status: {isLive ? 'Live Voting' : event.status}
                  </p>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
