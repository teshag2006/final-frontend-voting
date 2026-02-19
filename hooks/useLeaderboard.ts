// @ts-nocheck
import { useState, useEffect, useCallback, useRef } from 'react';

export interface LeaderboardEntry {
  rank: number;
  contestantId: string;
  name: string;
  voteCount: number;
  category?: string;
  previousRank?: number;
  percentageToLeader?: number;
}

export interface LeaderboardData {
  entries: LeaderboardEntry[];
  totalVotes: number;
  lastUpdated: Date;
  updateIntervalMs: number;
}

interface UseLeaderboardOptions {
  eventId?: string;
  categoryId?: string;
  limit?: number;
  pollingIntervalMs?: number;
  enabled?: boolean;
  onError?: (error: Error) => void;
}

const DEFAULT_POLLING_INTERVAL = 60000; // 60 seconds

export function useLeaderboard({
  eventId,
  categoryId,
  limit = 100,
  pollingIntervalMs = DEFAULT_POLLING_INTERVAL,
  enabled = true,
  onError,
}: UseLeaderboardOptions) {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(enabled);
  const [error, setError] = useState<Error | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousEntriesRef = useRef<LeaderboardEntry[]>([]);
  const errorCountRef = useRef(0);
  const maxErrorsRef = useRef(3);

  // Build URL based on filters
  const getUrl = useCallback(() => {
    if (!enabled) return null;

    const params = new URLSearchParams({
      limit: limit.toString(),
    });

    if (eventId) params.append('eventId', eventId);
    if (categoryId) params.append('categoryId', categoryId);

    return `/api/leaderboard?${params.toString()}`;
  }, [enabled, eventId, categoryId, limit]);

  const fetchLeaderboard = useCallback(async () => {
    const url = getUrl();
    if (!url) return null;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch leaderboard: ${response.statusText}`);
      }

      const jsonData = await response.json();
      errorCountRef.current = 0;

      const entriesWithChanges = jsonData.entries.map((entry: LeaderboardEntry) => {
        const previousEntry = previousEntriesRef.current.find(
          (e) => e.contestantId === entry.contestantId
        );

        return {
          ...entry,
          previousRank: previousEntry?.rank,
          percentageToLeader:
            jsonData.entries.length > 0
              ? ((entry.voteCount / jsonData.entries[0].voteCount) * 100).toFixed(1)
              : 100,
        };
      });

      previousEntriesRef.current = entriesWithChanges;
      const nextData = {
        ...jsonData,
        entries: entriesWithChanges,
        lastUpdated: new Date(),
        updateIntervalMs: pollingIntervalMs,
      };

      setLeaderboardData(nextData);
      setLastUpdated(new Date());
      setError(null);
      return nextData;
    } catch (err) {
      errorCountRef.current += 1;
      const nextError = err instanceof Error ? err : new Error(String(err));
      setError(nextError);

      if (errorCountRef.current >= maxErrorsRef.current) {
        onError?.(nextError);
      }

      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getUrl, onError, pollingIntervalMs]);

  useEffect(() => {
    let isMounted = true;

    const schedule = async () => {
      if (!isMounted) return;
      await fetchLeaderboard();
      const interval =
        errorCountRef.current > 0
          ? pollingIntervalMs * Math.pow(2, errorCountRef.current)
          : pollingIntervalMs;
      timerRef.current = setTimeout(schedule, interval);
    };

    setIsLoading(true);
    schedule();

    return () => {
      isMounted = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [fetchLeaderboard, pollingIntervalMs]);

  // Detect rank changes and trigger animations
  const getRankChange = useCallback(
    (contestantId: string): { direction: 'up' | 'down' | 'none'; amount: number } => {
      const current = data?.entries.find((e) => e.contestantId === contestantId);
      const previous = previousEntriesRef.current.find((e) => e.contestantId === contestantId);

      if (!current || !previous) return { direction: 'none', amount: 0 };

      const change = previous.rank - current.rank;

      if (change > 0) return { direction: 'up', amount: change };
      if (change < 0) return { direction: 'down', amount: Math.abs(change) };
      return { direction: 'none', amount: 0 };
    },
    [data?.entries]
  );

  // Manual refresh with exponential backoff reset
  const refresh = useCallback(async () => {
    errorCountRef.current = 0;
    await fetchLeaderboard();
  }, [fetchLeaderboard]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      previousEntriesRef.current = [];
    };
  }, []);

  return {
    // Data
    leaderboard: leaderboardData?.entries || [],
    totalVotes: leaderboardData?.totalVotes || 0,
    lastUpdated,
    updateIntervalMs: leaderboardData?.updateIntervalMs || pollingIntervalMs,

    // State
    isLoading,
    isError: !!error,
    error,

    // Methods
    refresh,
    getRankChange,
    mutate: refresh,

    // Utils
    isStale: Date.now() - lastUpdated.getTime() > pollingIntervalMs,
  };
}

/**
 * Hook for live vote count for a single contestant
 * Lighter weight than full leaderboard when you just need one contestant's votes
 */
export function useLiveContestantVotes(
  contestantId?: string,
  options?: UseLeaderboardOptions
) {
  const leaderboard = useLeaderboard({ ...options, limit: 1 });

  const contestant = leaderboard.leaderboard.find((e) => e.contestantId === contestantId);

  return {
    voteCount: contestant?.voteCount || 0,
    rank: contestant?.rank || 0,
    rankChange: contestant ? leaderboard.getRankChange(contestantId || '') : undefined,
    ...leaderboard,
  };
}


