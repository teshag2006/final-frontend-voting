// @ts-nocheck
import type { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { ContestantListCard } from '@/components/category/contestant-list-card';
import { CategorySponsorShowcase } from '@/components/category/category-sponsor-showcase';
import { EventCountdown } from '@/components/events/event-countdown';
import { getEventBySlug, getCategoriesForEvent, getContestantsForEvent } from '@/lib/mock-data-generator';
import { getEventSponsors } from '@/lib/sponsorship-mock';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ eventSlug: string; categorySlug: string }>;
}): Promise<Metadata> {
  const { eventSlug, categorySlug } = await params;
  const event = getEventBySlug(eventSlug);
  const category = getCategoriesForEvent(eventSlug).find((item: any) => item.slug === categorySlug);

  return {
    title: `${category?.name || 'Category'} - ${event?.name || 'Event'} | Vote Online`,
    description: category?.description || `Browse contestants in ${category?.name || 'this category'}`,
    alternates: {
      canonical: `/events/${eventSlug}/categories/${categorySlug}`,
    },
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

  const event = getEventBySlug(eventSlug);
  const categories = getCategoriesForEvent(eventSlug);
  const category = categories.find((item: any) => item.slug === categorySlug);

  if (!event || !category) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <h1 className="text-2xl font-bold">Category not found</h1>
      </div>
    );
  }

  const contestants = getContestantsForEvent(eventSlug).filter(
    (contestant: any) => String(contestant.category || '').toLowerCase() === String(category.name || '').toLowerCase(),
  );
  const sortedContestants = [...contestants].sort((a: any, b: any) => Number(b.votes ?? 0) - Number(a.votes ?? 0));
  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(sortedContestants.length / pageSize));
  const requestedPage = Number(resolvedSearchParams?.page || '1');
  const currentPage = Number.isFinite(requestedPage)
    ? Math.min(totalPages, Math.max(1, Math.floor(requestedPage)))
    : 1;
  const startIndex = (currentPage - 1) * pageSize;
  const pagedContestants = sortedContestants.slice(startIndex, startIndex + pageSize);

  const sponsorFitByCategory: Record<string, string> = {
    beauty: 'Beauty and personal care campaigns',
    talent: 'Creator tools, media, and entertainment products',
    grace: 'Lifestyle and premium brand storytelling',
    excellence: 'Innovation, leadership, and high-performance products',
  };
  const mockCategorySponsorSlides: Record<
    string,
    Array<{
      id: string;
      name: string;
      logoUrl: string;
      href: string;
      fitLabel: string;
    }>
  > = {
    beauty: [
      {
        id: 'beauty-slide-1',
        name: 'GlowNest Skincare',
        logoUrl: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=220&fit=crop',
        href: '/sponsors',
        fitLabel: 'Clean beauty and skincare visibility campaigns',
      },
      {
        id: 'beauty-slide-2',
        name: 'Luxe Silk Cosmetics',
        logoUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=220&fit=crop',
        href: '/sponsors',
        fitLabel: 'Premium makeup launches for beauty-first audiences',
      },
      {
        id: 'beauty-slide-3',
        name: 'Radiant Hair Studio',
        logoUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=220&fit=crop',
        href: '/sponsors',
        fitLabel: 'Haircare and styling partnerships for category finalists',
      },
    ],
    excellence: [
      {
        id: 'excellence-slide-1',
        name: 'Prime Leadership Institute',
        logoUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=220&fit=crop',
        href: '/sponsors',
        fitLabel: 'Innovation, leadership, and high-performance products',
      },
      {
        id: 'excellence-slide-2',
        name: 'Vertex Tech Systems',
        logoUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=220&fit=crop',
        href: '/sponsors',
        fitLabel: 'Enterprise technology awareness campaigns',
      },
    ],
  };
  const fallbackFit = 'Brand campaigns aligned to this audience segment';
  const eventSponsors = getEventSponsors(eventSlug);
  const categoryKey = String(category.slug || '').toLowerCase();
  const sponsorShowcaseItems =
    mockCategorySponsorSlides[categoryKey] && mockCategorySponsorSlides[categoryKey].length > 0
      ? mockCategorySponsorSlides[categoryKey]
      : eventSponsors.map((sponsor, idx) => ({
          id: sponsor.id || `${sponsor.name}-${idx}`,
          name: sponsor.name,
          logoUrl: sponsor.logo_url || sponsor.logoUrl || '/favicon.ico',
          href: '/sponsors',
          fitLabel: sponsorFitByCategory[categoryKey] || fallbackFit,
        }));

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="bg-gradient-to-b from-slate-50 to-white border-b border-slate-200">
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
                    In the category <span className="font-bold">{contestants.length}</span>
                  </p>
                </div>
              </div>

              {(event.status === 'UPCOMING' || event.status === 'LIVE' || event.status === 'active') && (
                <div className="w-full lg:w-[320px] lg:justify-self-end">
                  <EventCountdown
                    startDate={event.start_date}
                    endDate={event.end_date}
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
            {pagedContestants.map((contestant: any, index: number) => (
              <ContestantListCard
                key={contestant.id}
                eventSlug={eventSlug}
                contestant={{
                  id: contestant.slug || contestant.id,
                  full_name: contestant.name,
                  profile_image_url: contestant.image_url,
                  total_votes: Number(contestant.votes ?? 0),
                  rank: startIndex + index + 1,
                  country: contestant.country ?? 'N/A',
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
