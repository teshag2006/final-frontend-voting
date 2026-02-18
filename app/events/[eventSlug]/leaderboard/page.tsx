// @ts-nocheck
import { Metadata } from "next";
import { getMockLeaderboardData } from "@/lib/leaderboard-mock";
import { LiveLeaderboardPage } from "@/components/leaderboard/live-leaderboard-page";
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

  const data = getMockLeaderboardData(event.id);
  return <LiveLeaderboardPage event={event} initialData={data} />;
}

