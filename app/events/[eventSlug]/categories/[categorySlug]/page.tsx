import type { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { ContestantListCard } from '@/components/category/contestant-list-card';
import { CategorySponsorShowcase } from '@/components/category/category-sponsor-showcase';
import { EventCountdown } from '@/components/events/event-countdown';
import {
  getEventBySlug,
  getEventCategories,
  getPublicCategoryContestants,
  getEventSponsorsPublic,
} from '@/lib/api';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ eventSlug: string; categorySlug: string }>;
}): Promise<Metadata> {
  const { eventSlug, categorySlug } = await params;
  const [event, categories] = await Promise.all([
    getEventBySlug(eventSlug),
    getEventCategories(eventSlug, { limit: 100 }),
  ]);
  const category = categories.find((item) => item.slug === categorySlug);

  return {
    title: `${category?.name || 'Category'} - ${event?.name || 'Event'} | Vote Online`,
    description: category?.description || `Browse contestants in ${category?.name || 'this category'}`,
    alternates: { canonical: `/events/${eventSlug}/categories/${categorySlug}` },
  };
}

export default async function CategoryDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ eventSlug: string; categorySlug: string }>;
  searchParams?: Promise<{ page?: string }>;
}) {
  const { eventSlug, categorySlug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const pageSize = 8;
  const requestedPage = Number(resolvedSearchParams?.page || '1');
  const safeRequestedPage = Number.isFinite(requestedPage)
    ? Math.max(1, Math.floor(requestedPage))
    : 1;

  const [event, categories, eventSponsors] = await Promise.all([
    getEventBySlug(eventSlug),
    getEventCategories(eventSlug, { limit: 100 }),
    getEventSponsorsPublic(eventSlug),
  ]);
  const category = categories.find((item) => item.slug === categorySlug);

  if (!event || !category) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <h1 className="text-2xl font-bold">Category not found</h1>
      </div>
    );
  }

  const contestantsPage = await getPublicCategoryContestants(category.id, {
    page: safeRequestedPage,
    limit: pageSize,
    sort: 'votes_desc',
  });
  const totalPages = Math.max(1, Number(contestantsPage.pagination.pages || 1));
  const currentPage = Math.min(totalPages, Math.max(1, Number(contestantsPage.pagination.page || 1)));
  const startIndex = (currentPage - 1) * pageSize;
  const pagedContestants = contestantsPage.items;

  const sponsorFitByCategory: Record<string, string> = {
    beauty: 'Beauty and personal care campaigns',
    talent: 'Creator tools, media, and entertainment products',
    grace: 'Lifestyle and premium brand storytelling',
    excellence: 'Innovation, leadership, and high-performance products',
  };

  const categoryKey = String(category.slug || '').toLowerCase();
  const fallbackFit = 'Brand campaigns aligned to this audience segment';
  const sponsorShowcaseItems = eventSponsors.map((sponsor: any, idx: number) => ({
    id: sponsor.id || `${sponsor.name}-${idx}`,
    name: sponsor.name,
    logoUrl: (sponsor.logo_url || sponsor.logoUrl || '/favicon.ico') as string,
    href: '/sponsors',
    fitLabel: sponsorFitByCategory[categoryKey] || fallbackFit,
  }));

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-4">
              <CategorySponsorShowcase categoryName={category.name} items={sponsorShowcaseItems} />
            </div>
            <div className="grid gap-3 lg:grid-cols-3 lg:items-start">
              <div className="space-y-1.5">
                <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                  {category.name}
                </h1>
                <p className="text-base text-muted-foreground">{event.name}</p>
                {category.description ? (
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                ) : null}
              </div>

              <div className="lg:justify-self-center">
                <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    #Contestants
                  </p>
                  <p className="text-sm text-foreground">
                    In the category <span className="font-bold">{contestantsPage.pagination.total}</span>
                  </p>
                </div>
              </div>

              {(event.status === 'UPCOMING' || event.status === 'LIVE' || event.status === 'active') && (
                <div className="w-full lg:w-[320px] lg:justify-self-end">
                  <EventCountdown
                    startDate={event.start_date || ''}
                    endDate={event.end_date || ''}
                    eventStatus={event.status}
                    compact
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {pagedContestants.map((contestant, index) => (
              <ContestantListCard
                key={contestant.id}
                eventSlug={eventSlug}
                contestant={{
                  id: contestant.slug || contestant.id,
                  full_name: contestant.name,
                  profile_image_url: contestant.image_url,
                  total_votes: Number(contestant.votes || 0),
                  rank: startIndex + index + 1,
                  country: contestant.country || 'N/A',
                  is_verified: true,
                }}
              />
            ))}
          </div>
          {totalPages > 1 ? (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              <Link
                href={`/events/${eventSlug}/categories/${categorySlug}?page=${Math.max(1, currentPage - 1)}`}
                className={`rounded-md border px-3 py-2 text-sm ${
                  currentPage === 1
                    ? 'pointer-events-none border-slate-200 text-slate-400'
                    : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
                }`}
              >
                Previous
              </Link>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Link
                  key={page}
                  href={`/events/${eventSlug}/categories/${categorySlug}?page=${page}`}
                  className={`rounded-md border px-3 py-2 text-sm ${
                    page === currentPage
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  {page}
                </Link>
              ))}
              <Link
                href={`/events/${eventSlug}/categories/${categorySlug}?page=${Math.min(totalPages, currentPage + 1)}`}
                className={`rounded-md border px-3 py-2 text-sm ${
                  currentPage === totalPages
                    ? 'pointer-events-none border-slate-200 text-slate-400'
                    : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
                }`}
              >
                Next
              </Link>
            </div>
          ) : null}
        </div>
      </main>

      <Footer />
    </div>
  );
}
