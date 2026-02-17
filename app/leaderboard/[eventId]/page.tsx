import { Metadata } from 'next';
import { getMockLeaderboardData } from '@/lib/leaderboard-mock';
import { LeaderboardPodium } from '@/components/leaderboard/leaderboard-podium';
import { LeaderboardTable } from '@/components/leaderboard/leaderboard-table';
import { LeaderboardFilters } from '@/components/leaderboard/leaderboard-filters';
import { LiveStatusBadge } from '@/components/leaderboard/live-status-badge';
import { BlockchainVerification } from '@/components/leaderboard/blockchain-verification';

interface LeaderboardPageProps {
  params: Promise<{
    eventId: string;
  }>;
}

export async function generateMetadata(
  { params }: LeaderboardPageProps
): Promise<Metadata> {
  const { eventId } = await params;
  
  return {
    title: 'Live Leaderboard',
    description: 'View real-time voting leaderboard and standings',
    robots: { index: true, follow: true },
  };
}

export default async function LeaderboardPage({ params }: LeaderboardPageProps) {
  const { eventId } = await params;
  
  // Fetch leaderboard data - in production, this would call your API
  const data = getMockLeaderboardData(eventId);

  const handleExport = async (format: 'csv' | 'pdf') => {
    // In production, this would call an API endpoint
    console.log(`Exporting ${format}...`);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{data.event.name}</h1>
              <p className="text-slate-600 mt-1">Live Leaderboard</p>
            </div>
            <LiveStatusBadge
              status={data.event.status}
              countdownSeconds={data.event.countdownSeconds}
              lastUpdated={data.lastUpdated}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <p className="text-slate-600 text-sm font-medium">Total Votes</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">
              {(data.totalVotes / 1000000).toFixed(2)}M
            </p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <p className="text-slate-600 text-sm font-medium">Blockchain Status</p>
            <p className="text-sm font-semibold text-green-600 mt-2">✓ Verified on Ethereum</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <p className="text-slate-600 text-sm font-medium">Active Categories</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{data.categories.length}</p>
          </div>
        </div>

        {/* Podium Section */}
        {data.podium && (
          <div className="bg-white rounded-lg border border-slate-200 p-6 md:p-8 mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-8">Top 3 Performers</h2>
            <LeaderboardPodium
              first={data.podium.first}
              second={data.podium.second}
              third={data.podium.third}
            />
          </div>
        )}

        {/* Filters */}
        <LeaderboardFilters
          categories={data.categories}
          onExport={handleExport}
        />

        {/* Leaderboard Table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden mb-8">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">Full Leaderboard</h2>
          </div>
          <LeaderboardTable
            contestants={data.leaderboard}
            showRevenue={true}
            showTrend={true}
          />
        </div>

        {/* Blockchain Verification */}
        <BlockchainVerification
          network="Ethereum"
          hash="0x7a8b...c9d2"
          blockNumber="19751489"
          timestamp={new Date().toISOString()}
          explorerUrl="https://etherscan.io/tx/0x7a8b...c9d2"
        />
      </div>
    </main>
  );
}
