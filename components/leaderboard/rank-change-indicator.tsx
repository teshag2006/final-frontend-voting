'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RankChangeIndicatorProps {
  currentRank: number;
  previousRank?: number;
  voteCount: number;
  leaderVoteCount?: number;
  showPercentageToLeader?: boolean;
  animate?: boolean;
  className?: string;
}

export function RankChangeIndicator({
  currentRank,
  previousRank,
  voteCount,
  leaderVoteCount = 0,
  showPercentageToLeader = true,
  animate = true,
  className,
}: RankChangeIndicatorProps) {
  const [showAnimation, setShowAnimation] = useState(animate);

  useEffect(() => {
    if (animate) {
      setShowAnimation(true);
      const timer = setTimeout(() => setShowAnimation(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [previousRank, animate]);

  const rankChange = previousRank ? previousRank - currentRank : 0;
  const isImprovement = rankChange > 0;
  const isDecline = rankChange < 0;

  const percentageToLeader =
    leaderVoteCount > 0 ? ((voteCount / leaderVoteCount) * 100).toFixed(1) : '0';

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Rank */}
      <div className="flex items-center gap-1">
        <span className="text-2xl font-bold text-primary">#{currentRank}</span>
      </div>

      {/* Rank Change Indicator */}
      {previousRank && rankChange !== 0 && (
        <div
          className={cn(
            'flex items-center gap-1 px-2 py-1 rounded-full text-sm font-semibold transition-all',
            isImprovement
              ? 'bg-green-100 text-green-700'
              : isDecline
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-700',
            showAnimation && 'animate-pulse'
          )}
          role="status"
          aria-label={
            isImprovement
              ? `Improved ${rankChange} positions`
              : isDecline
                ? `Dropped ${Math.abs(rankChange)} positions`
                : 'No rank change'
          }
        >
          {isImprovement ? (
            <>
              <TrendingUp className="h-4 w-4" />
              <span>+{rankChange}</span>
            </>
          ) : isDecline ? (
            <>
              <TrendingDown className="h-4 w-4" />
              <span>-{Math.abs(rankChange)}</span>
            </>
          ) : (
            <>
              <Minus className="h-4 w-4" />
              <span>No change</span>
            </>
          )}
        </div>
      )}

      {/* Percentage to Leader */}
      {showPercentageToLeader && leaderVoteCount > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{percentageToLeader}%</span>
          <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${Math.min(parseFloat(percentageToLeader), 100)}%` }}
              aria-hidden="true"
            />
          </div>
          <span className="text-xs">to leader</span>
        </div>
      )}

      {/* Vote Count Badge (Optional) */}
      <div className="ml-auto text-right">
        <div className="text-sm text-muted-foreground">Votes</div>
        <div className="text-lg font-bold text-foreground">{voteCount.toLocaleString()}</div>
      </div>
    </div>
  );
}

/**
 * Compact version for use in tables
 */
export function CompactRankChange({
  currentRank,
  previousRank,
  className,
}: Omit<RankChangeIndicatorProps, 'voteCount' | 'showPercentageToLeader'>) {
  const rankChange = previousRank ? previousRank - currentRank : 0;
  const isImprovement = rankChange > 0;
  const isDecline = rankChange < 0;

  if (!rankChange || rankChange === 0) {
    return <span className={cn('text-muted-foreground', className)}>—</span>;
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 font-semibold',
        isImprovement ? 'text-green-600' : 'text-red-600',
        className
      )}
    >
      {isImprovement ? (
        <>
          <TrendingUp className="h-4 w-4" />
          <span>+{rankChange}</span>
        </>
      ) : (
        <>
          <TrendingDown className="h-4 w-4" />
          <span>-{Math.abs(rankChange)}</span>
        </>
      )}
    </span>
  );
}
