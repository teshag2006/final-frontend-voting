/**
 * Media Dashboard Mock Data
 * Replace with actual API calls in production
 */

import type {
  OverviewStats,
  VoteTrend,
  TopContestant,
  GeoDistribution,
  PaymentProvider,
  FraudSummary,
  BlockchainStatus,
  AnchoredBatch,
} from '@/types/media';

export const mockOverviewStats: OverviewStats = {
  totalVotes: 1245678,
  activeContestants: 12,
  votesToday: 23475,
  totalRevenue: 124000,
  avgVotePrice: 2.50,
  totalTransactions: 58320,
  fraudFlagsToday: 27,
  activeCountries: 42,
  anchoredBatches: 312,
  eventStatus: 'OPEN',
};

export const mockVoteTrends: VoteTrend[] = [
  { timestamp: 'Apr 10', totalVotes: 8000 },
  { timestamp: 'Apr 12', totalVotes: 10500 },
  { timestamp: 'Apr 14', totalVotes: 12300 },
  { timestamp: 'Apr 16', totalVotes: 14200 },
  { timestamp: 'Apr 17', totalVotes: 13800 },
  { timestamp: 'Apr 18', totalVotes: 15600 },
  { timestamp: 'Apr 19', totalVotes: 17200 },
  { timestamp: 'Apr 21', totalVotes: 16500 },
  { timestamp: 'Apr 23', totalVotes: 18900 },
  { timestamp: 'Apr 24', totalVotes: 20100 },
];

export const mockTopContestants: TopContestant[] = [
  {
    rank: 1,
    name: 'Abebe Kebede',
    category: 'Music',
    votes: 325890,
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    totalVotes: 325890,
    revenue: 12300,
    trend: 'up',
  },
  {
    rank: 2,
    name: 'Hana Tesfaye',
    category: 'Dance',
    votes: 298120,
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    totalVotes: 298120,
    revenue: 16000,
    trend: 'down',
  },
  {
    rank: 3,
    name: 'Dawit Bekele',
    category: 'Acting',
    votes: 245678,
    avatar: 'https://randomuser.me/api/portraits/men/53.jpg',
    totalVotes: 245678,
    revenue: 11100,
    trend: 'up',
  },
  {
    rank: 4,
    name: 'Selamawit Alemu',
    category: 'Comedy',
    votes: 198450,
    avatar: 'https://randomuser.me/api/portraits/women/63.jpg',
    totalVotes: 198450,
    revenue: 7800,
    trend: 'down',
  },
  {
    rank: 5,
    name: 'Fitsum Tadesse',
    category: 'Art',
    votes: 156320,
    avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
    totalVotes: 156320,
    revenue: 56900,
    trend: 'up',
  },
  {
    rank: 6,
    name: 'Meron Getachew',
    avatar: 'https://randomuser.me/api/portraits/women/72.jpg',
    totalVotes: 37400,
    revenue: 4200,
    trend: 'up',
  },
  {
    rank: 7,
    name: 'Yonas Haile',
    avatar: 'https://randomuser.me/api/portraits/men/76.jpg',
    totalVotes: 25610,
    revenue: 7060,
    trend: 'up',
  },
  {
    rank: 8,
    name: 'Bethlehem Mekonnen',
    avatar: 'https://randomuser.me/api/portraits/women/81.jpg',
    totalVotes: 33182,
    revenue: 3620,
    trend: 'down',
  },
  {
    rank: 9,
    name: 'Natnael Girma',
    avatar: 'https://randomuser.me/api/portraits/men/85.jpg',
    totalVotes: 31625,
    revenue: 1960,
    trend: 'down',
  },
  {
    rank: 10,
    name: 'Eden Assefa',
    avatar: 'https://randomuser.me/api/portraits/women/88.jpg',
    totalVotes: 30990,
    revenue: 3920,
    trend: 'up',
  },
];

export const mockGeoDistribution: GeoDistribution[] = [
  { country: 'Nigeria', voteCount: 28500, uniqueDevices: 15200, revenue: 45600, percentage: 22.9 },
  { country: 'Philippines', voteCount: 22400, uniqueDevices: 12100, revenue: 35800, percentage: 18.0 },
  { country: 'Ethiopia', voteCount: 19300, uniqueDevices: 10500, revenue: 42100, percentage: 15.5 },
  { country: 'Kenya', voteCount: 17100, uniqueDevices: 9200, revenue: 28300, percentage: 13.7 },
  { country: 'Ethiopia', voteCount: 16500, uniqueDevices: 8900, revenue: 32400, percentage: 13.2 },
  { country: 'Ethiopia', voteCount: 12800, uniqueDevices: 6900, revenue: 28700, percentage: 10.3 },
  { country: 'Ethiopia', voteCount: 9600, uniqueDevices: 5200, revenue: 21500, percentage: 7.7 },
];

export const mockPaymentProviders: PaymentProvider[] = [
  { name: 'Stripe', totalPayments: 175200, completedAmount: 324550, failedCount: 2100, percentage: 54 },
  { name: 'PayPal', totalPayments: 85600, completedAmount: 90800, failedCount: 1200, percentage: 28 },
  { name: 'Crypto', totalPayments: 45300, completedAmount: 58400, failedCount: 800, percentage: 18 },
];

export const mockFraudSummary: FraudSummary = {
  totalReports: 156,
  criticalCases: 12,
  resolved: 128,
  pending: 16,
};

export const mockBlockchainStatus: BlockchainStatus = {
  networkStatus: 'Connected',
  currentBlockHeight: 18456789,
  totalAnchoredBatches: 312,
  lastAnchorTimestamp: new Date().toISOString(),
  contractAddress: '0x742d35Cc6634C0532925a3b844Bc73e5ebc9C5a4',
  networkName: 'Ethereum Mainnet',
};

export const mockAnchoredBatches: AnchoredBatch[] = [
  {
    batchId: 'BATCH-0034521',
    blockNumber: 18456789,
    voteCount: 12450,
    merkleRoot: '0x7d4c5e6f8a9b1c2d3e4f5a6b7c8d9e0f1a2b3c4d',
    transactionHash: '0x9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e',
    anchoredAt: new Date().toISOString(),
    status: 'Confirmed',
  },
  {
    batchId: 'BATCH-0034520',
    blockNumber: 18456750,
    voteCount: 11890,
    merkleRoot: '0x6c3b4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c',
    transactionHash: '0x8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d',
    anchoredAt: new Date(Date.now() - 3600000).toISOString(),
    status: 'Confirmed',
  },
  {
    batchId: 'BATCH-0034519',
    blockNumber: 18456712,
    voteCount: 10230,
    merkleRoot: '0x5b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c',
    transactionHash: '0x7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c',
    anchoredAt: new Date(Date.now() - 7200000).toISOString(),
    status: 'Confirmed',
  },
];

