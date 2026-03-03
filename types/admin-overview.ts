export interface SystemMetrics {
  activeEvents: number;
  totalVotes: number;
  totalRevenue: number;
  fraudReports: number;
  confirmedAnchors: number;
  totalUsers: number;
  totalContestants: number;
  paidVotes: number;
}

export interface VoteActivityPoint {
  timestamp: string;
  validVotes: number;
  pendingVotes: number;
  fraudFlaggedVotes: number;
}

export interface VoteActivityData {
  data: VoteActivityPoint[];
  range: '24h' | '7d';
  lastUpdate?: string;
}

export interface RevenueProviderBreakdown {
  provider: string;
  amount: number;
  percentage: number;
  transactionCount: number;
}

export interface RevenueTrendPoint {
  date: string;
  revenue: number;
  transactions: number;
}

export interface RevenueAnalytics {
  byProvider: RevenueProviderBreakdown[];
  trend: RevenueTrendPoint[];
  totalRevenue: number;
  averageTransaction: number;
}

export interface FraudSummary {
  total: number;
  critical: number;
  high: number;
  pending: number;
  resolved: number;
  fraudVotesRemoved: number;
  criticalPercentage: number;
}

export interface FraudAlert {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  type: string;
  description: string;
  timestamp: string;
  status: 'pending' | 'investigating' | 'resolved';
  eventName?: string;
}

export interface DeviceRiskDistributionItem {
  riskLevel: 'high' | 'medium' | 'low';
  count: number;
  percentage: number;
}

export interface DeviceRiskOverview {
  highRiskDevices: number;
  botFlaggedDevices: number;
  riskDistribution: DeviceRiskDistributionItem[];
  averageTrustScore: number;
}

export interface BlockchainStatus {
  totalBatches: number;
  confirmedAnchors: number;
  pendingAnchors: number;
  averageTimeToAnchor: number;
  networkUsed: string;
  lastAnchorTime: string;
}

export interface SystemEvent {
  id: string;
  type:
    | 'fraud_alert'
    | 'payment_failure'
    | 'velocity_violation'
    | 'trust_score_drop'
    | 'webhook_failure'
    | 'system_error';
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  timestamp: string;
  related?: {
    eventName?: string;
    deviceId?: string;
    userId?: string;
    [key: string]: unknown;
  };
}

export interface SystemEventsResponse {
  events: SystemEvent[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
  };
}
