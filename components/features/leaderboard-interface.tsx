'use client';

import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, RotateCw, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ContestantRank {
  id: string;
  rank: number;
  previousRank?: number;
  name: string;
  votes: number;
  category: string;
  image: string;
  percentageOfTotal: number;
}

interface LeaderboardInterfaceProps {
  contestants: ContestantRank[];
  isLoading?: boolean;
  onRefresh?: () => void;
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
}

export function LeaderboardInterface({
  contestants,
  isLoading = false,
  onRefresh,
  selectedCategory = 'all',
  onCategoryChange,
}: LeaderboardInterfaceProps) {
  const [sortBy, setSortBy] = useState<'rank' | 'votes'>('rank');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const sortedContestants = useMemo(() => {
    const sorted = [...contestants].sort((a, b) => {
      if (sortBy === 'votes') {
        return sortOrder === 'desc' ? b.votes - a.votes : a.votes - b.votes;
      }
      return sortOrder === 'desc' ? b.rank - a.rank : a.rank - b.rank;
    });
    return sorted;
  }, [contestants, sortBy, sortOrder]);

  const getRankChange = (current: number, previous?: number) => {
    if (!previous) return null;
    const change = previous - current;
    return change > 0 ? { direction: 'up', change } : { direction: 'down', change: Math.abs(change) };
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold">Leaderboard</h2>
          <p className="text-sm text-gray-600 mt-1">{contestants.length} contestants</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
            <RotateCw className={cn('w-4 h-4 mr-2', isLoading && 'animate-spin')} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter and Sort Controls */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange?.(e.target.value)}
            className="px-3 py-2 border rounded-lg bg-white text-sm"
          >
            <option value="all">All Categories</option>
            <option value="beauty">Beauty</option>
            <option value="talent">Talent</option>
            <option value="advocacy">Advocacy</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'rank' | 'votes')}
            className="px-3 py-2 border rounded-lg bg-white text-sm"
          >
            <option value="rank">Rank</option>
            <option value="votes">Votes</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {sortOrder === 'asc' ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Rank</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Contestant</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Category</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Votes</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Percentage</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Change</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {sortedContestants.map((contestant, idx) => {
              const rankChange = getRankChange(contestant.rank, contestant.previousRank);
              const isTopThree = contestant.rank <= 3;

              return (
                <tr
                  key={contestant.id}
                  className={cn(
                    'hover:bg-gray-50 transition-colors',
                    isTopThree && 'bg-yellow-50'
                  )}
                >
                  <td className="px-6 py-4">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                        contestant.rank === 1
                          ? 'bg-yellow-400 text-white'
                          : contestant.rank === 2
                            ? 'bg-gray-400 text-white'
                            : contestant.rank === 3
                              ? 'bg-orange-400 text-white'
                              : 'bg-gray-200'
                      )}
                    >
                      {contestant.rank}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={contestant.image}
                        alt={contestant.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <span className="font-medium text-gray-900">{contestant.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{contestant.category}</td>
                  <td className="px-6 py-4 text-right font-semibold text-gray-900">
                    {contestant.votes.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-600">
                    {contestant.percentageOfTotal.toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 text-center">
                    {rankChange ? (
                      <div className="flex items-center justify-center gap-1">
                        {rankChange.direction === 'up' ? (
                          <ChevronUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-red-600" />
                        )}
                        <span className={rankChange.direction === 'up' ? 'text-green-600' : 'text-red-600'}>
                          {rankChange.change}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto"></div>
          <p className="text-gray-600 mt-2">Updating leaderboard...</p>
        </div>
      )}
    </div>
  );
}
