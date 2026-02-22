// @ts-nocheck
import type { Metadata } from 'next';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { CategoryHeader } from '@/components/category/category-header';
import { ContestantListCard } from '@/components/category/contestant-list-card';
import { EventCountdown } from '@/components/events/event-countdown';
import { getEventBySlug, getCategoriesForEvent, getContestantsForEvent } from '@/lib/mock-data-generator';

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
}: {
  params: Promise<{ eventSlug: string; categorySlug: string }>;
}) {
  const { eventSlug, categorySlug } = await params;

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

  const headerCategory = {
    ...category,
    event_name: event.name,
    contestant_count: contestants.length,
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="bg-gradient-to-b from-slate-50 to-white border-b border-slate-200">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <CategoryHeader category={headerCategory} eventSlug={eventSlug} />
          </div>
        </div>

        {(event.status === 'UPCOMING' || event.status === 'LIVE' || event.status === 'active') && (
          <div className="bg-white border-b border-slate-200">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              <EventCountdown startDate={event.start_date} endDate={event.end_date} eventStatus={event.status} />
            </div>
          </div>
        )}

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {[...contestants]
              .sort((a: any, b: any) => Number(b.votes ?? 0) - Number(a.votes ?? 0))
              .map((contestant: any, index: number) => (
              <ContestantListCard
                key={contestant.id}
                contestant={{
                  id: contestant.slug || contestant.id,
                  full_name: contestant.name,
                  profile_image_url: contestant.image_url,
                  total_votes: Number(contestant.votes ?? 0),
                  rank: index + 1,
                  country: contestant.country ?? 'N/A',
                  is_verified: true,
                }}
              />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
