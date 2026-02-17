import { MediaDashboardHeader } from '@/components/media/dashboard-header';
import { MediaDashboardNav } from '@/components/media/dashboard-nav';
import { OverviewSection } from '@/components/media/overview-section';
import { VoteAnalyticsSection } from '@/components/media/vote-analytics-section';
import { MediaAssetsSection } from '@/components/media/media-assets-section';
import { LiveLeaderboardWidget } from '@/components/media/live-leaderboard-widget';
import { RevenueSnapshotWidget } from '@/components/media/revenue-snapshot-widget';
import { BlockchainInfoWidget } from '@/components/media/blockchain-info-widget';
import {
  mockOverviewStats,
  mockVoteTrends,
  mockTopContestants,
  mockPaymentProviders,
  mockBlockchainStatus,
} from '@/lib/media-mock';

export default function MediaDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <MediaDashboardHeader />
      <MediaDashboardNav />

      <main className="px-4 py-8 md:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview Section */}
            <section>
              <OverviewSection stats={mockOverviewStats} />
            </section>

            {/* Vote Analytics */}
            <section>
              <VoteAnalyticsSection 
                trendData={mockVoteTrends}
                categoryData={mockPaymentProviders}
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
              <LiveLeaderboardWidget contestants={mockTopContestants} />
            </section>

            {/* Revenue Snapshot */}
            <section>
              <RevenueSnapshotWidget stats={mockOverviewStats} />
            </section>

            {/* Blockchain Info */}
            <section>
              <BlockchainInfoWidget blockchain={mockBlockchainStatus} />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
