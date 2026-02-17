'use client';

import Image from 'next/image';
import { LeaderboardContestant } from '@/types/leaderboard';
import { Badge } from '@/components/ui/badge';

interface LeaderboardTableProps {
  contestants: LeaderboardContestant[];
  showRevenue?: boolean;
  showTrend?: boolean;
}

function TrendIcon({ trend, change }: { trend?: 'up' | 'down' | 'neutral'; change?: number }) {
  if (!trend || trend === 'neutral') {
    return <span className="text-slate-400">→</span>;
  }
  
  const color = trend === 'up' ? 'text-green-600' : 'text-red-600';
  const arrow = trend === 'up' ? '↑' : '↓';
  
  return (
    <span className={color}>
      {arrow}
    </span>
  );
}

function getRankBadge(rank: number) {
  switch (rank) {
    case 1:
      return <span className="text-xl font-bold text-yellow-600">🥇</span>;
    case 2:
      return <span className="text-xl font-bold text-slate-400">🥈</span>;
    case 3:
      return <span className="text-xl font-bold text-orange-600">🥉</span>;
    default:
      return <span className="font-bold text-slate-500">{rank}</span>;
  }
}

export function LeaderboardTable({
  contestants,
  showRevenue = false,
  showTrend = true,
}: LeaderboardTableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="px-4 py-3 text-left font-semibold text-slate-700">Rank</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-700">Contestant</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-700">Category</th>
            <th className="px-4 py-3 text-right font-semibold text-slate-700">Free</th>
            <th className="px-4 py-3 text-right font-semibold text-slate-700">Paid</th>
            <th className="px-4 py-3 text-right font-semibold text-slate-700">Total Votes</th>
            {showTrend && <th className="px-4 py-3 text-right font-semibold text-slate-700">Trend</th>}
            {showTrend && <th className="px-4 py-3 text-right font-semibold text-slate-700">24h Change</th>}
            {showRevenue && <th className="px-4 py-3 text-right font-semibold text-slate-700">Revenue</th>}
          </tr>
        </thead>
        <tbody>
          {contestants.map((contestant) => (
            <tr
              key={contestant.contestantId}
              className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
            >
              <td className="px-4 py-4 text-center">
                {getRankBadge(contestant.rank)}
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 flex-shrink-0">
                    <Image
                      src={contestant.profileImageUrl}
                      alt={`${contestant.firstName} ${contestant.lastName}`}
                      fill
                      className="object-cover rounded-full"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-900">
                      {contestant.firstName} {contestant.lastName}
                    </span>
                    {contestant.verified && (
                      <Badge variant="secondary" className="w-fit mt-0.5">Verified</Badge>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-4 py-4 text-slate-700">{contestant.categoryName}</td>
              <td className="px-4 py-4 text-right text-slate-700">
                {(contestant.freeVotes / 1000).toFixed(0)}K
              </td>
              <td className="px-4 py-4 text-right text-slate-700">
                {(contestant.paidVotes / 1000).toFixed(0)}K
              </td>
              <td className="px-4 py-4 text-right">
                <span className="font-bold text-slate-900">
                  {(contestant.totalVotes / 1000).toFixed(1)}K
                </span>
                {contestant.votePercentage && (
                  <div className="text-xs text-slate-500">
                    {contestant.votePercentage.toFixed(1)}%
                  </div>
                )}
              </td>
              {showTrend && (
                <td className="px-4 py-4 text-right">
                  <TrendIcon trend={contestant.trend} />
                </td>
              )}
              {showTrend && (
                <td className="px-4 py-4 text-right">
                  <span className={contestant.last24hChange && contestant.last24hChange > 0 ? 'text-green-600' : 'text-red-600'}>
                    {contestant.last24hChange && contestant.last24hChange > 0 ? '+' : ''}
                    {(contestant.last24hChange || 0).toLocaleString()}
                  </span>
                </td>
              )}
              {showRevenue && (
                <td className="px-4 py-4 text-right font-semibold text-slate-900">
                  ${contestant.totalRevenue.toFixed(2)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
