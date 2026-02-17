import { Metadata } from 'next';
import Image from 'next/image';
import { getMockResultsData } from '@/lib/leaderboard-mock';
import { LeaderboardTable } from '@/components/leaderboard/leaderboard-table';
import { BlockchainVerification } from '@/components/leaderboard/blockchain-verification';
import { Badge } from '@/components/ui/badge';

interface ResultsPageProps {
  params: Promise<{
    eventId: string;
  }>;
}

export async function generateMetadata(
  { params }: ResultsPageProps
): Promise<Metadata> {
  const { eventId } = await params;
  
  return {
    title: 'Final Results',
    description: 'View final results and winners',
    robots: { index: true, follow: true },
  };
}

export default async function ResultsPage({ params }: ResultsPageProps) {
  const { eventId } = await params;
  
  // Fetch results data - in production, this would call your API
  const data = getMockResultsData(eventId);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Final Results</h1>
              <p className="text-slate-600 mt-2">
                Voting closed on April 17, 2024
                <Badge className="ml-3 bg-green-600">END</Badge>
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Winners Grid */}
        <div className="space-y-12">
          {data.winners.map((winner, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white rounded-xl border border-slate-200 p-6 md:p-8"
            >
              {/* Winner Card */}
              <div className="flex flex-col items-center justify-center relative">
                <div className="absolute inset-0 opacity-10 rounded-lg bg-gradient-to-br from-yellow-200 to-amber-200"></div>
                <div className="relative z-10">
                  <div className="relative w-48 h-56 mx-auto mb-6">
                    <div className="absolute inset-0 bg-gradient-to-b from-amber-100 to-yellow-50 rounded-2xl"></div>
                    <Image
                      src={winner.contestant.profileImageUrl}
                      alt={`${winner.contestant.firstName} ${winner.contestant.lastName}`}
                      fill
                      className="object-cover rounded-2xl p-2"
                    />
                    <div className="absolute -top-6 right-0 text-6xl">{winner.medallion}</div>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-amber-200 text-amber-900 px-4 py-2 rounded-full font-bold whitespace-nowrap">
                      Winner
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-center text-slate-900 mt-8">
                    {winner.contestant.firstName} {winner.contestant.lastName}
                  </h2>
                  <p className="text-center text-slate-600 mt-2">{winner.contestant.categoryName}</p>
                  <p className="text-center text-3xl font-bold text-slate-900 mt-4">
                    {winner.contestant.totalVotes.toLocaleString()}
                  </p>
                  <p className="text-center text-slate-600">Votes</p>
                </div>
              </div>

              {/* Category Leaderboard */}
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-6">
                  {winner.contestant.categoryName} - Final Rankings
                </h3>
                <div className="space-y-3">
                  {winner.leaderboard.slice(0, 4).map((contestant, rank) => (
                    <div
                      key={contestant.contestantId}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <span className="font-bold text-lg text-slate-500 min-w-8">
                          {rank + 1}.
                        </span>
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 flex-shrink-0">
                            <Image
                              src={contestant.profileImageUrl}
                              alt={`${contestant.firstName} ${contestant.lastName}`}
                              fill
                              className="object-cover rounded-full"
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">
                              {contestant.firstName} {contestant.lastName}
                            </p>
                            {contestant.verified && (
                              <Badge variant="secondary" className="text-xs mt-1">
                                Verified
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900">
                          {contestant.totalVotes.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-500">Votes</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Overall Top Contestants */}
        <div className="mt-12 bg-white rounded-xl border border-slate-200 p-6 md:p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Overall Top Performers</h2>
          <LeaderboardTable
            contestants={data.topContestants}
            showRevenue={false}
            showTrend={false}
          />
        </div>

        {/* Blockchain Verification */}
        <div className="mt-12">
          <BlockchainVerification
            hash={data.event.blockchainHash}
            network={data.event.blockchainNetwork || 'Bitcoin'}
            explorerUrl={data.event.blockchainExplorerUrl}
            timestamp={data.event.votingEndedAt}
          />
        </div>

        {/* Transparency Statement */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-sm text-blue-900">
            All results are finalized and securely recorded using our fraud detection and blockchain anchoring system to ensure transparency and integrity.
          </p>
        </div>
      </div>
    </main>
  );
}
