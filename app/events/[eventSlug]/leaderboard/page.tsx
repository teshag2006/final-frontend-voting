import { Metadata } from "next";
import { getMockLeaderboardData } from "@/lib/leaderboard-mock";
import { LeaderboardPodium } from "@/components/leaderboard/leaderboard-podium";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { LeaderboardFilters } from "@/components/leaderboard/leaderboard-filters";
import { LiveStatusBadge } from "@/components/leaderboard/live-status-badge";
import { BlockchainVerification } from "@/components/leaderboard/blockchain-verification";
import { EventCountdown } from "@/components/events/event-countdown";
import { mockEvents } from "@/lib/events-mock";

interface LeaderboardPageProps {
  params: Promise<{
    eventSlug: string;
  }>;
}

export async function generateMetadata({
  params,
}: LeaderboardPageProps): Promise<Metadata> {
  const { eventSlug } = await params;
  const event = mockEvents.find((e) => e.slug === eventSlug);

  return {
    title: `Live Leaderboard - ${event?.name || "Event"}`,
    description: "View real-time voting leaderboard and standings",
    robots: { index: true, follow: true },
    alternates: {
      canonical: `/events/${eventSlug}/leaderboard`,
    },
  };
}

export default async function LeaderboardPage({
  params,
}: LeaderboardPageProps) {
  const { eventSlug } = await params;

  const event = mockEvents.find((e) => e.slug === eventSlug);

  if (!event) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <h1 className="text-2xl font-bold">Event not found</h1>
      </div>
    );
  }

  // Fetch leaderboard data - in production, this would call your API with event context
  const data = getMockLeaderboardData(event.id);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {event.name}
              </h1>
              <p className="mt-1 text-slate-600">Live Leaderboard</p>
            </div>
            <LiveStatusBadge
              status={data.event.status}
              countdownSeconds={data.event.countdownSeconds}
              lastUpdated={data.lastUpdated}
            />
          </div>
        </div>
      </header>

      {/* Countdown for upcoming events */}
      {event.status === "UPCOMING" && (
        <div className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <EventCountdown
              startDate={event.start_date}
              endDate={event.end_date}
              eventStatus={event.status}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-600">Total Votes</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {data.stats.totalVotes.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-600">Total Contestants</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {data.stats.totalContestants}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-600">Active Categories</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {data.stats.activeCategories}
            </p>
          </div>
        </div>

        {/* Filters */}
        <LeaderboardFilters />

        {/* Podium */}
        <LeaderboardPodium podium={data.podium} eventSlug={eventSlug} />

        {/* Full Table */}
        <div className="mt-12">
          <h2 className="mb-6 text-2xl font-bold text-slate-900">
            Full Standings
          </h2>
          <LeaderboardTable
            entries={data.leaderboard}
            eventSlug={eventSlug}
          />
        </div>

        {/* Blockchain Verification */}
        {event.status === "LIVE" && (
          <BlockchainVerification eventSlug={eventSlug} />
        )}
      </div>
    </main>
  );
}
