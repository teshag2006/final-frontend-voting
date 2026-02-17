import type { Metadata } from "next";
import { EventNavbar } from "@/components/event-details/event-navbar";
import { EventHero } from "@/components/event-details/event-hero";
import { EventOverview } from "@/components/event-details/event-overview";
import { CategoriesSection } from "@/components/event-details/categories-section";
import { ContestantsSection } from "@/components/event-details/contestants-section";
import { LiveEventStats } from "@/components/event-details/live-event-stats";
import { LeaderboardPreview } from "@/components/event-details/leaderboard-preview";
import { EventTimelineCard } from "@/components/event-details/event-timeline-card";
import { FAQSection } from "@/components/event-details/faq-section";
import { Footer } from "@/components/footer";

// Mock data -- replace with API calls when backend is ready
import {
  mockEventDetail,
  mockEventStats,
  mockCategories,
  mockContestantsDetail,
  mockLeaderboard,
  mockFAQ,
} from "@/lib/event-details-mock";

// TODO: Replace with real API calls:
// import { getEventBySlug, getEventStats, getEventCategories, getEventContestants, getEventLeaderboard, getEventFAQ } from "@/lib/api";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  // TODO: const event = await getEventBySlug(slug);
  const event = mockEventDetail;
  return {
    title: `${event.name} - Vote Online | Talent Voting`,
    description: event.tagline ?? event.description,
    openGraph: {
      title: `${event.name} - Vote Online`,
      description: event.tagline ?? event.description,
      images: event.banner_url ? [event.banner_url] : [],
    },
  };
}

export default async function EventDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // TODO: Replace with real API calls:
  // const event = await getEventBySlug(slug);
  // const stats = await getEventStats(slug);
  // const categories = await getEventCategories(slug);
  // const contestants = await getEventContestants(slug);
  // const leaderboard = await getEventLeaderboard(slug, 4);
  // const faq = await getEventFAQ(slug);

  const event = mockEventDetail;
  const stats = mockEventStats;
  const categories = mockCategories;
  const contestants = mockContestantsDetail;
  const leaderboard = mockLeaderboard;
  const faq = mockFAQ;

  const isActive = event.status === "active";

  // Edge case: Cancelled event
  if (event.status === "cancelled") {
    return (
      <div className="flex min-h-screen flex-col">
        <EventNavbar />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">
              Event Unavailable
            </h1>
            <p className="mt-2 text-muted-foreground">
              This event has been cancelled.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <EventNavbar />

      <main className="flex-1">
        {/* Hero */}
        <EventHero event={event} />

        {/* Main content area */}
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:gap-6">
            {/* Left column */}
            <div className="flex min-w-0 flex-1 flex-col gap-8">
              {/* Event Overview */}
              <EventOverview event={event} />

              {/* Categories */}
              <CategoriesSection
                categories={categories}
                eventSlug={event.slug}
              />

              {/* Contestants */}
              <ContestantsSection
                contestants={contestants}
                isActive={isActive}
              />

              {/* FAQ */}
              <FAQSection items={faq} />
            </div>

            {/* Right sidebar */}
            <aside className="flex w-full flex-col gap-6 lg:w-80 lg:shrink-0">
              {/* Live Stats */}
              <LiveEventStats stats={stats} />

              {/* Leaderboard */}
              <LeaderboardPreview
                entries={leaderboard}
                eventSlug={event.slug}
              />

              {/* Event Timeline Card */}
              <EventTimelineCard stats={stats} eventSlug={event.slug} />
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
