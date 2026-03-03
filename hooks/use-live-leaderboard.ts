'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getEventLeaderboard } from '@/lib/api';

const NORMAL_REFRESH_MS = 60000;
const FINAL_MINUTES_REFRESH_MS = 20000;
const FINAL_WINDOW_SECONDS = 5 * 60;

type Contestant = {
  contestantId: string;
  contestantName: string;
  firstName: string;
  lastName: string;
  categoryId?: string;
  categoryName?: string;
  profileImage?: string;
  profileImageUrl: string;
  freeVotes: number;
  paidVotes: number;
  totalVotes: number;
  rank: number;
  trend?: 'up' | 'down' | 'neutral';
  last24hChange?: number;
  votePercentage?: number;
  totalRevenue: number;
  verified: boolean;
};

type LeaderboardPayload = {
  event: {
    id: string;
    name: string;
    status: string;
    countdownSeconds?: number;
  };
  categories: Array<{ id: string; name: string }>;
  leaderboard: Contestant[];
  totalVotes: number;
  lastUpdated?: string;
  generatedAt?: string;
  podium: {
    first?: Contestant;
    second?: Contestant;
    third?: Contestant;
  };
};

function normalizeLeaderboard(payload: LeaderboardPayload): LeaderboardPayload {
  const sorted = [...(payload.leaderboard || [])]
    .sort((a, b) => Number(b.totalVotes || 0) - Number(a.totalVotes || 0))
    .map((contestant, index) => ({ ...contestant, rank: index + 1 }))
    .slice(0, 5);

  return {
    ...payload,
    leaderboard: sorted,
    totalVotes: sorted.reduce((sum, row) => sum + Number(row.totalVotes || 0), 0),
    generatedAt: payload.generatedAt || payload.lastUpdated || new Date().toISOString(),
    podium: {
      first: sorted[0],
      second: sorted[1],
      third: sorted[2],
    },
  };
}

function getRefreshInterval(countdownSeconds?: number): number {
  if (
    typeof countdownSeconds === 'number' &&
    countdownSeconds > 0 &&
    countdownSeconds <= FINAL_WINDOW_SECONDS
  ) {
    return FINAL_MINUTES_REFRESH_MS;
  }
  return NORMAL_REFRESH_MS;
}

export function useLiveLeaderboard(eventSlug: string, initialData: LeaderboardPayload) {
  const previousRowsRef = useRef<Contestant[]>(initialData?.leaderboard || []);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [data, setData] = useState<LeaderboardPayload>(normalizeLeaderboard(initialData));
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(false);

  const loadLeaderboard = useCallback(async () => {
    setIsValidating(true);
    try {
      const rows = await getEventLeaderboard(eventSlug, 100);
      const categoriesMap = new Map<string, string>();
      rows.forEach((row) => {
        if (row.categoryId && row.categoryName) {
          categoriesMap.set(row.categoryId, row.categoryName);
        }
      });

      const payload = normalizeLeaderboard({
        ...data,
        leaderboard: rows.map((row) => ({
          contestantId: row.contestantId,
          contestantName: row.contestantName,
          firstName: row.firstName,
          lastName: row.lastName,
          categoryId: row.categoryId,
          categoryName: row.categoryName,
          profileImage: row.profileImage,
          profileImageUrl: row.profileImageUrl,
          freeVotes: row.freeVotes,
          paidVotes: row.paidVotes,
          totalVotes: row.totalVotes,
          rank: row.rank,
          trend: row.trend,
          last24hChange: row.last24hChange,
          votePercentage: row.votePercentage,
          totalRevenue: row.totalRevenue,
          verified: row.verified,
        })),
        categories: Array.from(categoriesMap.entries()).map(([id, name]) => ({ id, name })),
        lastUpdated: new Date().toISOString(),
      });

      setData(payload);
      setError(null);
      return payload;
    } catch {
      setError(new Error('leaderboard-unavailable'));
      return data;
    } finally {
      setIsLoading(false);
      setIsValidating(false);
    }
  }, [data, eventSlug]);

  useEffect(() => {
    let isMounted = true;
    const scheduleNext = (currentData?: LeaderboardPayload) => {
      if (!isMounted) return;
      const interval = getRefreshInterval(currentData?.event?.countdownSeconds);
      timerRef.current = setTimeout(async () => {
        const latest = await loadLeaderboard();
        scheduleNext(latest);
      }, interval);
    };

    loadLeaderboard().then((latest) => {
      if (isMounted) scheduleNext(latest);
    });

    return () => {
      isMounted = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [loadLeaderboard]);

  const changedContestantIds = useMemo(() => {
    const changed = new Set<string>();
    const currentRows = data?.leaderboard || [];
    const previousRows = previousRowsRef.current || [];

    currentRows.forEach((row) => {
      const previous = previousRows.find((item) => item.contestantId === row.contestantId);
      const rankChanged = previous && previous.rank !== row.rank;
      const votesIncreased = previous && Number(row.totalVotes || 0) > Number(previous.totalVotes || 0);
      if (rankChanged || votesIncreased) {
        changed.add(row.contestantId);
      }
    });

    return changed;
  }, [data?.leaderboard]);

  const leaderChanged = useMemo(() => {
    const previousLeader = previousRowsRef.current?.[0]?.contestantId;
    const currentLeader = data?.leaderboard?.[0]?.contestantId;
    return Boolean(previousLeader && currentLeader && previousLeader !== currentLeader);
  }, [data?.leaderboard]);

  useEffect(() => {
    if (data?.leaderboard?.length) {
      previousRowsRef.current = data.leaderboard;
    }
  }, [data?.leaderboard]);

  return {
    data,
    error,
    isLoading,
    isValidating,
    changedContestantIds,
    leaderChanged,
    refreshIntervalMs: getRefreshInterval(data?.event?.countdownSeconds),
    isFinalMinutes: getRefreshInterval(data?.event?.countdownSeconds) === FINAL_MINUTES_REFRESH_MS,
  };
}
