'use client';

import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface Contestant {
  rank: number;
  name: string;
  profileImage: string;
  category: string;
  votes: number;
  trend: 'up' | 'down' | 'stable';
}

interface LiveLeaderboardWidgetProps {
  contestants: any[];
}

export function LiveLeaderboardWidget({ contestants }: LiveLeaderboardWidgetProps) {
  // Get top 5 contestants
  const topContestants = contestants.slice(0, 5).map((c, i) => ({
    rank: i + 1,
    name: c.name,
    profileImage: c.profileImage,
    category: c.category || 'N/A',
    votes: c.votes,
    trend: i % 2 === 0 ? ('up' as const) : ('down' as const),
  }));

  return (
    <Card className="p-4 border-0 bg-white shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Live Leaderboard</h2>
      
      <div className="space-y-3">
        {/* Header */}
        <div className="hidden sm:grid grid-cols-5 gap-2 px-3 py-2 text-xs font-semibold text-gray-600">
          <div>Rank</div>
          <div>Contestant</div>
          <div>Category</div>
          <div>Votes</div>
          <div>Trend</div>
        </div>

        {/* Rows */}
        <div className="space-y-2">
          {topContestants.map((contestant) => (
            <div
              key={contestant.rank}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-6 text-center font-bold text-gray-900">{contestant.rank}</div>
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{contestant.name}</p>
                <p className="text-xs text-gray-600">{contestant.category}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-semibold text-gray-900">
                  {contestant.votes.toLocaleString()}
                </p>
                {contestant.trend === 'up' ? (
                  <TrendingUp className="w-4 h-4 text-emerald-600 ml-auto" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600 ml-auto" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
