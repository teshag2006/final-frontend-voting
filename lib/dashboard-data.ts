import {
  getAnalyticsData,
  getDashboardOverview,
  getEventDetails,
  getGeographicData,
  getNotifications,
  getRankingData,
  getRevenueData,
  getSecurityData,
} from '@/lib/api';

export const defaultRankingData = {
  current_rank: 0,
  total_contestants: 0,
  rank_movement: 0,
  vote_share_percentage: 0,
};

export const defaultRevenueData = {
  metrics: {
    total_revenue: 0,
    revenue_this_week: 0,
    revenue_this_month: 0,
  },
  snapshots: [],
  payment_methods: {
    stripe_percentage: 0,
    paypal_percentage: 0,
    other_percentage: 0,
  },
};

export const defaultSecurityData = {
  metrics: {
    trust_score: 0,
    trust_level: 'Unknown',
    device_reputation: 0,
    fraud_alerts_count: 0,
  },
  alerts: [],
};

export const defaultGeographicData = {
  countries: [],
  vpn_activity: {
    vpn_votes: 0,
    proxy_attempts: 0,
    tor_access: 0,
  },
};

export const defaultNotifications: any[] = [];

export const defaultEventDetails = {
  event_name: 'Unknown Event',
  category: 'Unknown',
  start_date: new Date().toISOString(),
  end_date: new Date().toISOString(),
  voting_deadline: new Date().toISOString(),
  rules_summary: '',
};

export async function getRankingDataSafe() {
  return (await getRankingData()) || defaultRankingData;
}

export async function getRevenueDataSafe() {
  return (await getRevenueData()) || defaultRevenueData;
}

export async function getSecurityDataSafe() {
  return (await getSecurityData()) || defaultSecurityData;
}

export async function getGeographicDataSafe() {
  return (await getGeographicData()) || defaultGeographicData;
}

export async function getNotificationsSafe() {
  return (await getNotifications()) || defaultNotifications;
}

export async function getEventDetailsSafe() {
  return (await getEventDetails()) || defaultEventDetails;
}

export async function getDashboardOverviewSafe() {
  return (await getDashboardOverview()) || null;
}

export async function getAnalyticsDataSafe() {
  return (await getAnalyticsData()) || null;
}
