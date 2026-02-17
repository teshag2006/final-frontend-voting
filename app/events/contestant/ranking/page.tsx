import type { Metadata } from 'next';
import { getRankingData } from '@/lib/api';
import { mockRankingData } from '@/lib/dashboard-mock';
import { StatsCard } from '@/components/dashboard/stats-card';
import { Award, TrendingUp, TrendingDown } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Ranking | Contestant Portal',
  description: 'View your ranking and position',
};

export default async function RankingPage() {
  const apiData = await getRankingData();
  const data = apiData || mockRankingData;

  const rankColor = data.rank_movement > 0
    ? 'text-green-600'
    : data.rank_movement < 0
    ? 'text-red-600'
    : 'text-muted-foreground';

  return (
    <div className="p-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Your Ranking</h1>
        <p className="text-muted-foreground">Track your position in the contest.</p>
      </div>

      {/* Ranking Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Current Rank"
          value={`#${data.current_rank}`}
          icon={<Award className="w-6 h-6 text-yellow-500" />}
        />
        <StatsCard
          title="Total Contestants"
          value={data.total_contestants}
          subtext="In category"
        />
        <StatsCard
          title="Rank Movement"
          value={
            <span className={rankColor}>
              {data.rank_movement > 0 ? '↑' : data.rank_movement < 0 ? '↓' : '→'}
              {Math.abs(data.rank_movement)}
            </span>
          }
          icon={
            data.rank_movement > 0 ? (
              <TrendingUp className="w-6 h-6 text-green-600" />
            ) : (
              <TrendingDown className="w-6 h-6 text-red-600" />
            )
          }
          subtext="Position change"
        />
        <StatsCard
          title="Vote Share"
          value={`${data.vote_share_percentage.toFixed(1)}%`}
          subtext="Of category votes"
        />
      </div>

      {/* Detailed Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Position Info */}
        <div className="bg-white rounded-lg border border-border p-8">
          <h2 className="text-lg font-semibold text-foreground mb-6">Position Details</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Current Rank</p>
              <p className="text-4xl font-bold text-accent">#{data.current_rank}</p>
            </div>
            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-2">Spots to Move Up</p>
              <p className="text-2xl font-semibold text-foreground">
                {data.current_rank === 1 ? '🏆 You\'re #1!' : data.current_rank - 1} to Top
              </p>
            </div>
          </div>
        </div>

        {/* Category Info */}
        <div className="bg-white rounded-lg border border-border p-8">
          <h2 className="text-lg font-semibold text-foreground mb-6">Category Standing</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Total Contestants</p>
              <p className="text-4xl font-bold text-foreground">{data.total_contestants}</p>
            </div>
            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-2">Your Vote Share</p>
              <div className="flex items-end gap-2">
                <p className="text-3xl font-bold text-primary">
                  {data.vote_share_percentage.toFixed(1)}%
                </p>
                <div className="flex-1 bg-secondary rounded-full h-3">
                  <div
                    className="bg-primary rounded-full h-3 transition-all"
                    style={{ width: `${data.vote_share_percentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">How Ranking Works</h3>
        <p className="text-sm text-blue-800">
          Rankings are calculated based on verified votes received. Only votes that pass our fraud detection
          and verification systems are counted. Your ranking is updated every hour.
        </p>
      </div>
    </div>
  );
}
