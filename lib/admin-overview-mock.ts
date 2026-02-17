import type {
  SystemMetrics,
  VoteActivityData,
  RevenueAnalytics,
  FraudSummary,
  DeviceRiskOverview,
  BlockchainStatus,
  SystemEventsResponse,
  FraudAlert,
} from '@/types/admin-overview';
import { mockEvents } from './events-mock';

// Generate system metrics based on actual events
export function generateSystemMetrics(): SystemMetrics {
  const activeEvents = mockEvents.filter((e) => e.status === 'LIVE' || e.status === 'active').length;
  const totalEvents = mockEvents.length;

  return {
    activeEvents,
    totalVotes: 1245678,
    totalRevenue: 2847560.5,
    fraudReports: 127,
    confirmedAnchors: 543,
    totalUsers: 87432,
    totalContestants: 48,
    paidVotes: 456789,
  };
}

// Generate vote activity chart data
export function generateVoteActivityData(range: '24h' | '7d'): VoteActivityData {
  const now = new Date();
  const data = [];
  const intervalHours = range === '24h' ? 1 : 24;
  const pointCount = range === '24h' ? 24 : 7;

  for (let i = pointCount - 1; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * intervalHours * 60 * 60 * 1000);
    data.push({
      timestamp: timestamp.toISOString(),
      validVotes: Math.floor(Math.random() * 5000) + 2000,
      pendingVotes: Math.floor(Math.random() * 1000) + 200,
      fraudFlaggedVotes: Math.floor(Math.random() * 100) + 10,
    });
  }

  return {
    data,
    range,
    lastUpdate: new Date().toISOString(),
  };
}

// Generate revenue analytics
export function generateRevenueAnalytics(): RevenueAnalytics {
  const totalRevenue = 2847560.5;
  const byProvider = [
    {
      provider: 'stripe' as const,
      amount: 1421780.25,
      percentage: 50,
      transactionCount: 45230,
    },
    {
      provider: 'paypal' as const,
      amount: 710890.13,
      percentage: 25,
      transactionCount: 18456,
    },
    {
      provider: 'crypto' as const,
      amount: 568512.06,
      percentage: 20,
      transactionCount: 2341,
    },
    {
      provider: 'manual' as const,
      amount: 146378.06,
      percentage: 5,
      transactionCount: 341,
    },
  ];

  const trend = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    trend.push({
      date: date.toISOString().split('T')[0],
      revenue: Math.floor(Math.random() * 150000) + 50000,
      transactions: Math.floor(Math.random() * 2000) + 500,
    });
  }

  return {
    byProvider,
    trend,
    totalRevenue,
    averageTransaction: 95.23,
  };
}

// Generate fraud summary
export function generateFraudSummary(): FraudSummary {
  return {
    total: 127,
    critical: 8,
    high: 24,
    pending: 31,
    resolved: 64,
    fraudVotesRemoved: 3421,
    criticalPercentage: 6.3,
  };
}

// Generate fraud alerts
export function generateFraudAlerts(): FraudAlert[] {
  return [
    {
      id: 'fraud-1',
      severity: 'critical',
      type: 'Botnet Activity',
      description: 'Detected 2,341 votes from same subnet in 5 minutes',
      timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
      status: 'pending',
      eventName: 'Miss Africa 2026',
    },
    {
      id: 'fraud-2',
      severity: 'high',
      type: 'Velocity Violation',
      description: 'User cast 450 votes in 2 hours (max: 100)',
      timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
      status: 'pending',
      eventName: 'Mr Africa 2026',
    },
    {
      id: 'fraud-3',
      severity: 'medium',
      type: 'Trust Score Drop',
      description: 'Device trust score decreased from 85 to 31',
      timestamp: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
      status: 'pending',
    },
    {
      id: 'fraud-4',
      severity: 'low',
      type: 'Suspicious Pattern',
      description: 'Similar voting pattern detected across 5 accounts',
      timestamp: new Date(Date.now() - 3 * 60 * 60000).toISOString(),
      status: 'resolved',
    },
  ];
}

// Generate device risk overview
export function generateDeviceRiskOverview(): DeviceRiskOverview {
  return {
    highRiskDevices: 234,
    botFlaggedDevices: 89,
    riskDistribution: [
      {
        riskLevel: 'high',
        count: 234,
        percentage: 0.27,
      },
      {
        riskLevel: 'medium',
        count: 456,
        percentage: 0.52,
      },
      {
        riskLevel: 'low',
        count: 160,
        percentage: 0.21,
      },
    ],
    averageTrustScore: 72.4,
  };
}

// Generate blockchain status
export function generateBlockchainStatus(): BlockchainStatus {
  return {
    totalBatches: 287,
    confirmedAnchors: 543,
    pendingAnchors: 12,
    averageTimeToAnchor: 245, // seconds
    networkUsed: 'Polygon',
    lastAnchorTime: new Date(Date.now() - 15 * 60000).toISOString(),
  };
}

// Generate system events feed
export function generateSystemEventsFeed(page = 1, pageSize = 20): SystemEventsResponse {
  const allEvents = [
    {
      id: 'event-1',
      type: 'fraud_alert' as const,
      title: 'Critical: Botnet Activity Detected',
      description: 'High-velocity voting from subnet 192.168.x.x',
      severity: 'critical' as const,
      timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
      related: {
        eventName: 'Miss Africa 2026',
        deviceId: 'dev-xyz-123',
      },
    },
    {
      id: 'event-2',
      type: 'payment_failure' as const,
      title: 'Payment Processing Error',
      description: 'Stripe webhook failed to process 3 transactions',
      severity: 'high' as const,
      timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
      related: {},
    },
    {
      id: 'event-3',
      type: 'velocity_violation' as const,
      title: 'Rate Limit Exceeded',
      description: 'User exceeded daily vote limit',
      severity: 'medium' as const,
      timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
      related: {
        eventName: 'Talent Africa 2026',
        userId: 'user-456',
      },
    },
    {
      id: 'event-4',
      type: 'trust_score_drop' as const,
      title: 'Device Trust Score Decreased',
      description: 'Device showed suspicious voting behavior',
      severity: 'medium' as const,
      timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
      related: {
        deviceId: 'dev-abc-789',
      },
    },
    {
      id: 'event-5',
      type: 'webhook_failure' as const,
      title: 'Webhook Delivery Failed',
      description: 'Failed to deliver blockchain anchor confirmation',
      severity: 'low' as const,
      timestamp: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
      related: {},
    },
  ];

  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedEvents = allEvents.slice(start, end);

  return {
    events: paginatedEvents,
    pagination: {
      total: allEvents.length,
      page,
      pageSize,
      hasMore: end < allEvents.length,
    },
  };
}

// Export all mock data bundled
export const mockAdminOverview = {
  metrics: generateSystemMetrics(),
  voteActivity24h: generateVoteActivityData('24h'),
  voteActivity7d: generateVoteActivityData('7d'),
  revenue: generateRevenueAnalytics(),
  fraud: generateFraudSummary(),
  fraudAlerts: generateFraudAlerts(),
  deviceRisk: generateDeviceRiskOverview(),
  blockchain: generateBlockchainStatus(),
  events: generateSystemEventsFeed(1, 20),
};
