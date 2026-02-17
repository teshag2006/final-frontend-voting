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
import { EventCountdown } from "@/components/events/event-countdown";

// Mock data
import {
  mockEventDetail,
  mockEventStats,
  mockCategories,
  mockContestantsDetail,
  mockLeaderboard,
  mockFAQ,
} from "@/lib/event-details-mock";
import { mockEvents } from "@/lib/events-mock";
import { getEventBySlug, getContestantsForEvent, getCategoriesForEvent } from "@/lib/mock-data-generator";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ eventSlug: string }>;
}): Promise<Metadata> {
  const { eventSlug } = await params;
  
  // Find event from mock data
  const event = mockEvents.find((e) => e.slug === eventSlug) || mockEventDetail;

  return {
    title: `${event.name} - Vote Online | Talent Voting`,
    description: event.tagline ?? event.description,
    openGraph: {
      title: `${event.name} - Vote Online`,
      description: event.tagline ?? event.description,
      images: event.banner_url ? [event.banner_url] : [],
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

  // Get event from mock data generator based on slug
  const event = getEventBySlug(eventSlug);
  const contestants = getContestantsForEvent(eventSlug);
  const categories = getCategoriesForEvent(eventSlug);
  
  // Use fallback data for other sections
  const stats = mockEventStats;
  const leaderboard = mockLeaderboard;
  const faq = mockFAQ;

  const isActive = event.status === "LIVE" || event.status === "active";

  // Edge case: Cancelled event
  if (event.status === "CANCELLED" || event.status === "cancelled") {
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
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <EventNavbar />

      <main className="flex-1">
        {/* Event Hero */}
        <EventHero event={event} isLive={isActive} />

        {/* Countdown Timer for upcoming events */}
        {event.status === "UPCOMING" && (
          <div className="bg-white border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <EventCountdown
                startDate={event.start_date}
                endDate={event.end_date}
                eventStatus={event.status}
              />
            </div>
          </div>
        )}

        {/* Event Stats */}
        {isActive && (
          <div className="bg-slate-50 border-b border-slate-200 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <LiveEventStats stats={stats} />
            </div>
          </div>
        )}

        {/* Event Overview */}
        <EventOverview event={event} />

        {/* Categories Section */}
        <CategoriesSection
          categories={categories}
          eventSlug={eventSlug}
          isVotingActive={isActive}
        />

        {/* Contestants Section */}
        <ContestantsSection
          contestants={contestants}
          eventSlug={eventSlug}
          isVotingActive={isActive}
        />

        {/* Leaderboard Preview */}
        {isActive && (
          <LeaderboardPreview
            leaderboard={leaderboard}
            eventSlug={eventSlug}
          />
        )}

        {/* Timeline */}
        <EventTimelineCard event={event} />

        {/* FAQ Section */}
        <FAQSection faq={faq} />
      </main>

      <Footer />
    </div>
  );
}
