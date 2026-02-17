import { Metadata } from "next";
import Image from "next/image";
import { getMockResultsData } from "@/lib/leaderboard-mock";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { BlockchainVerification } from "@/components/leaderboard/blockchain-verification";
import { Badge } from "@/components/ui/badge";
import { mockEvents } from "@/lib/events-mock";

interface ResultsPageProps {
  params: Promise<{
    eventSlug: string;
  }>;
}

export async function generateMetadata({
  params,
}: ResultsPageProps): Promise<Metadata> {
  const { eventSlug } = await params;
  const event = mockEvents.find((e) => e.slug === eventSlug);

  return {
    title: `Final Results - ${event?.name || "Event"}`,
    description: "View final results and winners",
    robots: { index: true, follow: true },
    alternates: {
      canonical: `/events/${eventSlug}/results`,
    },
  };
}

export default async function ResultsPage({ params }: ResultsPageProps) {
  const { eventSlug } = await params;

  const event = mockEvents.find((e) => e.slug === eventSlug);

  if (!event) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <h1 className="text-2xl font-bold">Event not found</h1>
      </div>
    );
  }

  // Fetch results data - in production, this would call your API with event context
  const data = getMockResultsData(event.id);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900">
                {event.name}
              </h1>
              <p className="mt-2 text-slate-600">
                Final Results
                <Badge className="ml-3 bg-green-600">COMPLETED</Badge>
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Winners Grid */}
        <div className="space-y-12">
          {data.winners.map((winner, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 gap-8 rounded-xl border border-slate-200 bg-white p-6 md:p-8 lg:grid-cols-2"
            >
              {/* Winner Card */}
              <div className="relative flex flex-col items-center justify-center">
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-yellow-200 to-amber-200 opacity-10"></div>
                <div className="relative">
                  <div className="mb-4 text-6xl font-bold text-amber-600">
                    #{idx + 1}
                  </div>
                  <div className="h-64 w-64 overflow-hidden rounded-lg border-4 border-amber-400">
                    <Image
                      src={winner.photo_url || "/images/placeholder.jpg"}
                      alt={winner.name}
                      width={256}
                      height={256}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  {idx === 0 && (
                    <Badge className="absolute -right-4 -top-4 rotate-12 bg-yellow-400 px-4 py-2 text-lg">
                      GRAND WINNER
                    </Badge>
                  )}
                </div>
              </div>

              {/* Winner Details */}
              <div className="flex flex-col justify-center space-y-4">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">
                    {winner.name}
                  </h2>
                  <p className="text-lg text-slate-600">
                    {winner.category_name} • {winner.country}
                  </p>
                </div>

                <div className="space-y-2 border-t border-slate-200 pt-4">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Votes</span>
                    <span className="font-bold text-slate-900">
                      {winner.total_votes.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Final Rank</span>
                    <span className="font-bold text-slate-900">
                      #{winner.rank}
                    </span>
                  </div>
                </div>

                <p className="pt-4 text-slate-700">
                  Congratulations on an outstanding performance in the{" "}
                  {event.name}!
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Full Results Table */}
        <div className="mt-16">
          <h2 className="mb-6 text-2xl font-bold text-slate-900">
            Complete Rankings
          </h2>
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <LeaderboardTable
              entries={data.leaderboard}
              eventSlug={eventSlug}
            />
          </div>
        </div>

        {/* Blockchain Verification */}
        <div className="mt-16">
          <BlockchainVerification eventSlug={eventSlug} />
        </div>
      </div>
    </main>
  );
}
