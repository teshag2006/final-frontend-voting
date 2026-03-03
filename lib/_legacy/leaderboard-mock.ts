import { LeaderboardResponse, ResultsPageData, TrendData } from '@/types/leaderboard';

type LiveRow = {
  contestantId: string;
  totalVotes: number;
  rank: number;
};

let liveTick = 0;

function hashId(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) % 100000;
  }
  return hash;
}

// Applies live mock effects so UI updates come from mock data behavior.
export function applyMockLeaderboardEffects<T extends LiveRow>(rows: T[]): T[] {
  if (!rows.length) return rows;

  liveTick += 1;
  const spotlightId = rows[liveTick % rows.length]?.contestantId;
  const cooldownId = rows[(liveTick + 1) % Math.min(rows.length, 4)]?.contestantId;

  return rows
    .map((row) => {
      const base = 90 + Math.floor(Math.random() * 240);
      const rankPressure = Math.max(0, 12 - row.rank) * 22;
      const challengerBoost = row.rank >= 3 && row.rank <= 8 ? 180 + Math.floor(Math.random() * 900) : 0;
      const spotlightBoost =
        row.contestantId === spotlightId ? 2000 + Math.floor(Math.random() * 4200) : 0;
      const cooldown = row.contestantId === cooldownId ? -(220 + Math.floor(Math.random() * 500)) : 0;

      const wave = Math.sin((liveTick + hashId(row.contestantId) % 11) * 0.9);
      const waveBoost = Math.round((wave + 1) * 190);

      // Deliberately make Selamawit move up/down around rank 3-6 during live ticks.
      let selamawitSwing = 0;
      if (row.contestantId === 'selamawit-alemu') {
        const phase = liveTick % 6;
        if (phase === 0) selamawitSwing = 2600;
        if (phase === 1) selamawitSwing = 900;
        if (phase === 2) selamawitSwing = -450;
        if (phase === 3) selamawitSwing = 1800;
        if (phase === 4) selamawitSwing = -650;
      }

      const swing = Math.floor((Math.random() - 0.45) * 220);
      const increment = Math.max(
        20,
        base + rankPressure + challengerBoost + spotlightBoost + cooldown + waveBoost + selamawitSwing + swing,
      );

      return {
        ...row,
        totalVotes: row.totalVotes + increment,
      };
    })
    .sort((a, b) => b.totalVotes - a.totalVotes)
    .map((row, index) => ({
      ...row,
      rank: index + 1,
    }));
}

// Mock leaderboard data combining best features from both screenshots
export function getMockLeaderboardData(eventId: string): LeaderboardResponse {
  const contestants = [
    {
      rank: 1,
      contestantId: 'abebe-kebede',
      firstName: 'Abebe',
      lastName: 'Kebede',
      profileImageUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
      categoryName: 'Music',
      freeVotes: 150000,
      paidVotes: 175890,
      totalVotes: 325890,
      totalRevenue: 8796.50,
      verified: true,
      country: 'Ethiopia',
      votePercentage: 26.2,
      last24hChange: 8120,
      trend: 'up' as const,
    },
    {
      rank: 2,
      contestantId: 'hana-tesfaye',
      firstName: 'Hana',
      lastName: 'Tesfaye',
      profileImageUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
      categoryName: 'Dance',
      freeVotes: 120000,
      paidVotes: 178120,
      totalVotes: 298120,
      totalRevenue: 7953.20,
      verified: true,
      country: 'Ethiopia',
      votePercentage: 23.9,
      last24hChange: -1045,
      trend: 'down' as const,
    },
    {
      rank: 3,
      contestantId: 'dawit-bekele',
      firstName: 'Dawit',
      lastName: 'Bekele',
      profileImageUrl: 'https://randomuser.me/api/portraits/men/53.jpg',
      categoryName: 'Acting',
      freeVotes: 125000,
      paidVotes: 120678,
      totalVotes: 245678,
      totalRevenue: 6551.20,
      verified: true,
      country: 'Ethiopia',
      votePercentage: 19.7,
      last24hChange: 3560,
      trend: 'up' as const,
    },
    {
      rank: 4,
      contestantId: 'selamawit-alemu',
      firstName: 'Selamawit',
      lastName: 'Alemu',
      profileImageUrl: 'https://randomuser.me/api/portraits/women/63.jpg',
      categoryName: 'Comedy',
      freeVotes: 100000,
      paidVotes: 98450,
      totalVotes: 198450,
      totalRevenue: 5295.75,
      verified: true,
      country: 'Ethiopia',
      votePercentage: 16.0,
      last24hChange: 155,
      trend: 'neutral' as const,
    },
    {
      rank: 5,
      contestantId: 'fitsum-tadesse',
      firstName: 'Fitsum',
      lastName: 'Tadesse',
      profileImageUrl: 'https://randomuser.me/api/portraits/men/67.jpg',
      categoryName: 'Art',
      freeVotes: 90000,
      paidVotes: 66320,
      totalVotes: 156320,
      totalRevenue: 4168.50,
      verified: true,
      country: 'Ethiopia',
      votePercentage: 12.5,
      last24hChange: 2220,
      trend: 'up' as const,
    },
    {
      rank: 6,
      contestantId: 'meron-getachew',
      firstName: 'Meron',
      lastName: 'Getachew',
      profileImageUrl: 'https://randomuser.me/api/portraits/women/72.jpg',
      categoryName: 'Music',
      freeVotes: 60000,
      paidVotes: 29450,
      totalVotes: 89450,
      totalRevenue: 2385.00,
      verified: false,
      country: 'Ethiopia',
      votePercentage: 7.2,
      last24hChange: 120,
      trend: 'neutral' as const,
    },
    {
      rank: 7,
      contestantId: 'yonas-haile',
      firstName: 'Yonas',
      lastName: 'Haile',
      profileImageUrl: 'https://randomuser.me/api/portraits/men/76.jpg',
      categoryName: 'Dance',
      freeVotes: 55000,
      paidVotes: 21230,
      totalVotes: 76230,
      totalRevenue: 2033.20,
      verified: true,
      country: 'Ethiopia',
      votePercentage: 6.1,
      last24hChange: 2300,
      trend: 'up' as const,
    },
    {
      rank: 8,
      contestantId: 'bethlehem-mekonnen',
      firstName: 'Bethlehem',
      lastName: 'Mekonnen',
      profileImageUrl: 'https://randomuser.me/api/portraits/women/81.jpg',
      categoryName: 'Electronic',
      freeVotes: 40000,
      paidVotes: 14110,
      totalVotes: 54110,
      totalRevenue: 1443.50,
      verified: false,
      country: 'Ethiopia',
      votePercentage: 4.3,
      last24hChange: -900,
      trend: 'down' as const,
    },
    {
      rank: 9,
      contestantId: 'natnael-girma',
      firstName: 'Natnael',
      lastName: 'Girma',
      profileImageUrl: 'https://randomuser.me/api/portraits/men/85.jpg',
      categoryName: 'Acting',
      freeVotes: 25000,
      paidVotes: 7000,
      totalVotes: 32000,
      totalRevenue: 854.00,
      verified: true,
      country: 'Ethiopia',
      votePercentage: 2.6,
      last24hChange: 0,
      trend: 'neutral' as const,
    },
    {
      rank: 10,
      contestantId: 'eden-assefa',
      firstName: 'Eden',
      lastName: 'Assefa',
      profileImageUrl: 'https://randomuser.me/api/portraits/women/88.jpg',
      categoryName: 'Classical',
      freeVotes: 15000,
      paidVotes: 3000,
      totalVotes: 18000,
      totalRevenue: 480.00,
      verified: true,
      country: 'Ethiopia',
      votePercentage: 1.4,
      last24hChange: 780,
      trend: 'up' as const,
    },
  ];

  const totalVotes = contestants.reduce((sum, c) => sum + c.totalVotes, 0);

  return {
    event: {
      id: eventId,
      name: 'Talents of Tomorrow',
      status: 'live',
      startDate: '2024-04-10',
      endDate: '2024-04-25',
      countdownSeconds: 8520, // 2h 22m
    },
    categories: [
      { id: 'music', name: 'Music' },
      { id: 'dance', name: 'Dance' },
      { id: 'acting', name: 'Acting' },
      { id: 'comedy', name: 'Comedy' },
      { id: 'art', name: 'Art' },
    ],
    leaderboard: contestants,
    totalVotes: totalVotes,
    lastUpdated: new Date().toISOString(),
    generatedAt: new Date().toISOString(),
    updateEverySeconds: 180,
    podium: {
      first: contestants[0],
      second: contestants[1],
      third: contestants[2],
    },
  };
}

export function getMockResultsData(eventId: string): ResultsPageData {
  const leaderboard = getMockLeaderboardData(eventId);
  const contestants = leaderboard.leaderboard;

  // Group by category for results
  const categories = [
    { id: 'music', name: 'Singing', icon: '🎤', status: 'closed' as const },
    { id: 'dance', name: 'Dancing', icon: '💃', status: 'closed' as const },
    { id: 'acting', name: 'Acting', icon: '🎭', status: 'closed' as const },
  ];

  return {
    event: {
      id: eventId,
      name: 'Campus Star 2026',
      status: 'results',
      votingEndedAt: '2024-04-17T23:59:59Z',
      blockchainHash: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      blockchainNetwork: 'Bitcoin',
      blockchainExplorerUrl: 'https://blockchain.com/btc/tx/bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    },
    categories: categories,
    winners: [
      {
        rank: 1,
        medallion: '🥇',
        contestant: contestants[0],
        leaderboard: contestants.filter(c => c.categoryName === 'Music').slice(0, 5),
      },
      {
        rank: 1,
        medallion: '🥇',
        contestant: contestants[1],
        leaderboard: contestants.filter(c => c.categoryName === 'Dance').slice(0, 5),
      },
      {
        rank: 1,
        medallion: '🥇',
        contestant: contestants[2],
        leaderboard: contestants.filter(c => c.categoryName === 'Acting').slice(0, 5),
      },
    ],
    topContestants: contestants.slice(0, 10),
  };
}

export function getMockTrendData(): TrendData {
  const times = ['12 PM', '2 PM', '4 PM', '6 PM', '8 PM', '10 PM', '12 AM', '2 AM', '4 AM', '6 AM', '8 AM'];
  
  return {
    times,
    contestants: [
      {
        contestantId: 'abebe-kebede',
        name: 'Abebe Kebede',
        color: '#3B82F6',
        data: [152000, 172000, 185000, 198000, 212000, 228000, 245000, 265000, 285000, 305000, 325890],
      },
      {
        contestantId: 'hana-tesfaye',
        name: 'Hana Tesfaye',
        color: '#10B981',
        data: [145000, 160000, 175000, 188000, 200000, 215000, 232000, 250000, 270000, 285000, 298120],
      },
      {
        contestantId: 'dawit-bekele',
        name: 'Dawit Bekele',
        color: '#F59E0B',
        data: [148000, 158000, 168000, 180000, 192000, 205000, 220000, 235000, 245000, 245678, 245678],
      },
      {
        contestantId: 'selamawit-alemu',
        name: 'Selamawit Alemu',
        color: '#EF4444',
        data: [142000, 152000, 160000, 170000, 180000, 188000, 195000, 198000, 198300, 198400, 198450],
      },
      {
        contestantId: 'fitsum-tadesse',
        name: 'Fitsum Tadesse',
        color: '#8B5CF6',
        data: [138000, 142000, 145000, 148000, 150000, 152000, 154000, 155000, 155500, 156000, 156320],
      },
    ],
  };
}

