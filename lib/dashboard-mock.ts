import type {
  DashboardOverviewData,
  RankingData,
  DailyVote,
  VoteDistributionByHour,
  FraudDetectionMetrics,
  RevenueMetrics,
  RevenueSnapshot,
  PaymentMethodBreakdown,
  TrustSecurityMetrics,
  FraudAlert,
  GeographicData,
  VPNProxyActivity,
  SponsorVisibility,
  EventDetails,
  Notification,
} from '@/types/dashboard';

export const mockDashboardOverview: DashboardOverviewData = {
  metrics: {
    total_votes: 12430,
    free_votes: 4120,
    paid_votes: 8310,
    revenue_generated: 415500, // in cents
    revenue_trend: 12.5,
  },
  vote_snapshots: [
    { date: 'Jun 23', free_votes: 520, paid_votes: 810 },
    { date: 'Jun 24', free_votes: 610, paid_votes: 920 },
    { date: 'Jun 25', free_votes: 480, paid_votes: 750 },
    { date: 'Jun 26', free_votes: 690, paid_votes: 1100 },
    { date: 'Jun 27', free_votes: 550, paid_votes: 950 },
    { date: 'Jun 28', free_votes: 720, paid_votes: 1200 },
    { date: 'Jun 29', free_votes: 660, paid_votes: 1080 },
    { date: 'Jun 30', free_votes: 780, paid_votes: 1310 },
  ],
  top_countries: [
    { country: 'Ethiopia', country_code: 'ET', votes: 3200, revenue: 1200 },
    { country: 'Kenya', country_code: 'KE', votes: 2100, revenue: 980 },
    { country: 'USA', country_code: 'US', votes: 1500, revenue: 750 },
    { country: 'Nigeria', country_code: 'NG', votes: 1200, revenue: 600 },
  ],
  integrity_status: {
    blockchain_verified: true,
    fraud_detected: false,
    under_review: false,
  },
};

export const mockRankingData: RankingData = {
  current_rank: 1,
  total_contestants: 45,
  rank_movement: 2,
  vote_share_percentage: 12.8,
};

export const mockAnalyticsData = {
  daily_votes: [
    { date: 'Jun 21', free_votes: 420, paid_votes: 680 },
    { date: 'Jun 22', free_votes: 510, paid_votes: 790 },
    { date: 'Jun 23', free_votes: 520, paid_votes: 810 },
    { date: 'Jun 24', free_votes: 610, paid_votes: 920 },
    { date: 'Jun 25', free_votes: 480, paid_votes: 750 },
    { date: 'Jun 26', free_votes: 690, paid_votes: 1100 },
  ] as DailyVote[],
  hourly_distribution: [
    { hour: 0, votes: 45 },
    { hour: 1, votes: 32 },
    { hour: 2, votes: 28 },
    { hour: 3, votes: 20 },
    { hour: 4, votes: 18 },
    { hour: 5, votes: 25 },
    { hour: 6, votes: 38 },
    { hour: 7, votes: 52 },
    { hour: 8, votes: 68 },
    { hour: 9, votes: 85 },
    { hour: 10, votes: 92 },
    { hour: 11, votes: 88 },
    { hour: 12, votes: 95 },
    { hour: 13, votes: 82 },
    { hour: 14, votes: 78 },
    { hour: 15, votes: 85 },
    { hour: 16, votes: 90 },
    { hour: 17, votes: 98 },
    { hour: 18, votes: 110 },
    { hour: 19, votes: 125 },
    { hour: 20, votes: 130 },
    { hour: 21, votes: 115 },
    { hour: 22, votes: 95 },
    { hour: 23, votes: 65 },
  ] as VoteDistributionByHour[],
  fraud_metrics: {
    total_votes: 12430,
    suspicious_votes: 320,
    confirmed_fraud: 75,
    flagged_votes: 75,
    removed_votes: 75,
  } as FraudDetectionMetrics,
};

export const mockRevenueData = {
  metrics: {
    total_revenue: 415500,
    revenue_this_week: 85200,
    revenue_this_month: 310000,
  } as RevenueMetrics,
  snapshots: [
    { date: 'Jun 21', revenue: 8500 },
    { date: 'Jun 22', revenue: 9200 },
    { date: 'Jun 23', revenue: 10200 },
    { date: 'Jun 24', revenue: 11500 },
    { date: 'Jun 25', revenue: 9800 },
    { date: 'Jun 26', revenue: 13200 },
    { date: 'Jun 27', revenue: 12500 },
    { date: 'Jun 28', revenue: 10300 },
  ] as RevenueSnapshot[],
  payment_methods: {
    stripe_percentage: 60,
    paypal_percentage: 25,
    other_percentage: 15,
  } as PaymentMethodBreakdown,
};

export const mockSecurityData = {
  metrics: {
    trust_score: 92,
    trust_level: 'Excellent',
    device_reputation: 'Good',
    fraud_alerts_count: 3,
  } as TrustSecurityMetrics,
  alerts: [
    {
      id: '1',
      date: 'Jan 14',
      alert_type: 'High Voting Velocity',
      status: 'Resolved',
    },
    {
      id: '2',
      date: 'Jan 12',
      alert_type: 'VPN Detected',
      status: 'Auto-Blocked',
    },
    {
      id: '3',
      date: 'Jan 10',
      alert_type: 'Suspicious Activity',
      status: 'Reviewed',
    },
  ] as FraudAlert[],
};

export const mockGeographicData = {
  countries: [
    { country: 'Ethiopia', country_code: 'ET', votes: 3200, revenue: 1200 },
    { country: 'Kenya', country_code: 'KE', votes: 2100, revenue: 980 },
    { country: 'USA', country_code: 'US', votes: 1500, revenue: 750 },
    { country: 'Nigeria', country_code: 'NG', votes: 1200, revenue: 600 },
    { country: 'South Africa', country_code: 'ZA', votes: 800, revenue: 400 },
    { country: 'Ghana', country_code: 'GH', votes: 600, revenue: 300 },
    { country: 'Egypt', country_code: 'EG', votes: 450, revenue: 225 },
  ] as GeographicData[],
  vpn_activity: {
    vpn_votes: 180,
    proxy_attempts: 75,
    tor_access: 24,
  } as VPNProxyActivity,
};

export const mockSponsorsData: SponsorVisibility[] = [
  {
    sponsor_name: 'Tech Corp',
    impressions: 45230,
    engagement_metrics: 3420,
    click_through_rate: 7.5,
    campaign_period: 'Jan 1 - Jan 31',
  },
  {
    sponsor_name: 'Beauty Brand',
    impressions: 38920,
    engagement_metrics: 2890,
    click_through_rate: 7.4,
    campaign_period: 'Jan 5 - Feb 5',
  },
  {
    sponsor_name: 'Fashion Inc',
    impressions: 32450,
    engagement_metrics: 2210,
    click_through_rate: 6.8,
    campaign_period: 'Jan 10 - Feb 10',
  },
];

export const mockEventDetails: EventDetails = {
  event_name: 'Miss & Mister Continental 2026',
  category: 'Miss Africa',
  start_date: 'Jan 1, 2026',
  end_date: 'Jun 30, 2026',
  voting_deadline: 'May 31, 2026 23:59 UTC',
  rules_summary:
    'Voting is open to registered users worldwide. Each user can cast up to 10 free votes daily and unlimited paid votes. All votes are blockchain-verified and fraud-checked.',
};

export const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Milestone Reached',
    message: 'Congratulations! You have reached 10,000 votes!',
    timestamp: '2 hours ago',
    read: false,
    type: 'milestone',
  },
  {
    id: '2',
    title: 'Rank Change',
    message: 'You moved up 2 positions in the leaderboard',
    timestamp: '4 hours ago',
    read: false,
    type: 'rank_change',
  },
  {
    id: '3',
    title: 'Fraud Review',
    message: 'Suspicious activity detected and resolved',
    timestamp: '1 day ago',
    read: true,
    type: 'fraud_review',
  },
  {
    id: '4',
    title: 'Blockchain Update',
    message: 'Your votes have been successfully anchored to blockchain',
    timestamp: '2 days ago',
    read: true,
    type: 'blockchain',
  },
];
