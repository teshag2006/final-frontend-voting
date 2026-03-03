import type { Metadata } from 'next';
import { EventNavbar } from '@/components/event-details/event-navbar';
import { EventHero } from '@/components/event-details/event-hero';
import { EventOverview } from '@/components/event-details/event-overview';
import { CategoriesSection } from '@/components/event-details/categories-section';
import { ContestantsSection } from '@/components/event-details/contestants-section';
import { LiveEventStats } from '@/components/event-details/live-event-stats';
import { FAQSection } from '@/components/event-details/faq-section';
import { EventSponsorsSection } from '@/components/event-details/event-sponsors-section';
import { Footer } from '@/components/footer';
import {
  getEventBySlug,
  getEventCategories,
  getEventContestants,
  getEventFAQ,
  getEventSponsorsPublic,
  getEventStats,
} from '@/lib/api';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ eventSlug: string }>;
}): Promise<Metadata> {
  const { eventSlug } = await params;
  const event = await getEventBySlug(eventSlug);

  return {
    title: `${event?.name || 'Event'} - Vote Online | Talent Voting`,
    description: event?.tagline || event?.description || 'Event voting page',
    openGraph: {
      title: `${event?.name || 'Event'} - Vote Online`,
      description: event?.tagline || event?.description || 'Event voting page',
      images: event?.banner_url ? [event.banner_url] : [],
    },
    alternates: {
      canonical: `/events/${eventSlug}`,
    },
  };
}

export default async function EventDetailsPage({
  params,
}: {
  params: Promise<{ eventSlug: string }>;
}) {
  const { eventSlug } = await params;

  const [event, contestants, categories, stats, faq, eventSponsors] =
    await Promise.all([
      getEventBySlug(eventSlug),
      getEventContestants(eventSlug, { limit: 100 }),
      getEventCategories(eventSlug, { limit: 100 }),
      getEventStats(eventSlug),
      getEventFAQ(eventSlug),
      getEventSponsorsPublic(eventSlug),
    ]);

  if (!event) {
    return (
      <div className="flex min-h-screen flex-col">
        <EventNavbar />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Event Unavailable</h1>
            <p className="mt-2 text-muted-foreground">
              This event does not exist or is unavailable.
            </p>
          </div>
        </main>
      </div>
    );
  }

  const isActive = event.status === 'LIVE' || event.status === 'active';

  if (event.status === 'CANCELLED' || event.status === 'cancelled') {
    return (
      <div className="flex min-h-screen flex-col">
        <EventNavbar />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Event Unavailable</h1>
            <p className="mt-2 text-muted-foreground">This event has been cancelled.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <EventNavbar />

      <main className="flex-1">
        <EventHero event={event} />

        {isActive && stats && (
          <div className="border-b border-slate-200 bg-slate-50 py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <LiveEventStats stats={stats} />
            </div>
          </div>
        )}

        <EventOverview event={event} />
        <EventSponsorsSection sponsors={eventSponsors || []} eventSlug={eventSlug} />
        <CategoriesSection
          categories={categories}
          eventSlug={eventSlug}
          isVotingActive={isActive}
        />
        <ContestantsSection
          contestants={contestants}
          isActive={isActive}
          eventSlug={eventSlug}
        />
        <FAQSection items={faq} />
      </main>

      <Footer />
    </div>
  );
}
