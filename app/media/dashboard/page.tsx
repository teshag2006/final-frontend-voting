import { OverviewSection } from '@/components/media/overview-section';
import { VoteAnalyticsSection } from '@/components/media/vote-analytics-section';
import { MediaAssetsSection } from '@/components/media/media-assets-section';
import { LiveLeaderboardWidget } from '@/components/media/live-leaderboard-widget';
import { RevenueSnapshotWidget } from '@/components/media/revenue-snapshot-widget';
import { BlockchainInfoWidget } from '@/components/media/blockchain-info-widget';
import { getMediaDashboard } from '@/lib/api';

export const metadata = {
  title: 'Media Dashboard | Voting Platform',
  description: 'Real-time media broadcasting dashboard with voting analytics.',
};

export default async function MediaDashboardPage() {
  const data = (await getMediaDashboard()) || {};
  const overviewStats = {
    totalVotes: Number(data?.overview?.totalVotes || 0),
    activeContestants: Number(data?.overview?.activeContestants || 0),
    votesToday: Number(data?.overview?.votesToday || 0),
    totalRevenue: Number(data?.overview?.totalRevenue || 0),
    avgVotePrice: Number(data?.overview?.avgVotePrice || 0),
    totalTransactions: Number(data?.overview?.totalTransactions || 0),
  };
  const voteTrends = Array.isArray(data?.voteTrends) ? data.voteTrends : [];
  const topContestants = Array.isArray(data?.topContestants) ? data.topContestants : [];
  const paymentProviders = Array.isArray(data?.paymentProviders) ? data.paymentProviders : [];
  const blockchainStatus = data?.blockchainStatus || {};

  return (
    <main className="px-3 py-6 md:px-5 lg:px-6">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview Section */}
          <section>
            <OverviewSection stats={overviewStats} />
          </section>

          {/* Vote Analytics */}
          <section>
            <VoteAnalyticsSection
              trendData={voteTrends}
              categoryData={paymentProviders}
            />
          </section>

          {/* Media Assets */}
          <section>
            <MediaAssetsSection />
          </section>
        </div>

        {/* Right Column - Widgets */}
        <div className="space-y-6">
          {/* Live Leaderboard */}
          <section>
            <LiveLeaderboardWidget contestants={topContestants} />
          </section>

          {/* Revenue Snapshot */}
          <section>
            <RevenueSnapshotWidget stats={overviewStats} />
          </section>

          {/* Blockchain Info */}
          <section>
            <BlockchainInfoWidget blockchain={blockchainStatus} />
          </section>
        </div>
      </div>
    </main>
  );
}
