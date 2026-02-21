import { NextRequest, NextResponse } from 'next/server';
import { applyMockLeaderboardEffects, getMockLeaderboardData } from '@/lib/leaderboard-mock';

type LeaderboardRow = {
  contestantId: string;
  totalVotes: number;
  rank: number;
  [key: string]: unknown;
};

type LeaderboardSnapshot = ReturnType<typeof getMockLeaderboardData>;

const snapshotStore = new Map<string, LeaderboardSnapshot>();

function getOrInitSnapshot(eventId: string): LeaderboardSnapshot {
  const existing = snapshotStore.get(eventId);
  if (existing) return existing;

  const initial = getMockLeaderboardData(eventId);
  snapshotStore.set(eventId, initial);
  return initial;
}

export async function GET(request: NextRequest) {
  const eventId = request.nextUrl.searchParams.get('eventId') || 'event-1';
  const limitParam = Number(request.nextUrl.searchParams.get('limit') || '5');
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.floor(limitParam) : 5;

  const previous = getOrInitSnapshot(eventId);
  const updatedRows = applyMockLeaderboardEffects<LeaderboardRow>([...(previous.leaderboard || [])]);
  const trimmedRows = updatedRows.slice(0, limit);

  const snapshot: LeaderboardSnapshot = {
    ...previous,
    leaderboard: trimmedRows,
    totalVotes: trimmedRows.reduce((sum, row) => sum + Number(row.totalVotes || 0), 0),
    lastUpdated: new Date().toISOString(),
    generatedAt: new Date().toISOString(),
    podium: {
      first: trimmedRows[0],
      second: trimmedRows[1],
      third: trimmedRows[2],
    },
  };

  snapshotStore.set(eventId, snapshot);
  return NextResponse.json(snapshot);
}
