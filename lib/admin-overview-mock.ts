import { apiFetch } from '@/lib/api';
import { fetchAdminData } from '@/lib/admin-data-client';
import type {
  BlockchainStatus,
  DeviceRiskOverview,
  FraudAlert,
  FraudSummary,
  RevenueAnalytics,
  SystemEvent,
  SystemEventsResponse,
  SystemMetrics,
  VoteActivityData,
} from '@/types/admin-overview';

const EMPTY_METRICS: SystemMetrics = {
  activeEvents: 0,
  totalVotes: 0,
  totalRevenue: 0,
  fraudReports: 0,
  confirmedAnchors: 0,
  totalUsers: 0,
  totalContestants: 0,
  paidVotes: 0,
};

const EMPTY_REVENUE: RevenueAnalytics = {
  byProvider: [],
  trend: [],
  totalRevenue: 0,
  averageTransaction: 0,
};

const EMPTY_FRAUD: FraudSummary = {
  total: 0,
  critical: 0,
  high: 0,
  pending: 0,
  resolved: 0,
  fraudVotesRemoved: 0,
  criticalPercentage: 0,
};

const EMPTY_DEVICE_RISK: DeviceRiskOverview = {
  highRiskDevices: 0,
  botFlaggedDevices: 0,
  averageTrustScore: 0,
  riskDistribution: [],
};

const EMPTY_BLOCKCHAIN: BlockchainStatus = {
  totalBatches: 0,
  confirmedAnchors: 0,
  pendingAnchors: 0,
  averageTimeToAnchor: 0,
  networkUsed: 'N/A',
  lastAnchorTime: new Date(0).toISOString(),
};

function normalizeVoteActivityPoint(
  row: Record<string, unknown>
): VoteActivityData['data'][number] {
  return {
    timestamp: String(
      row.timestamp ||
        row.bucket ||
        row.created_at ||
        new Date().toISOString()
    ),
    validVotes: Number(row.validVotes ?? row.valid_votes ?? 0),
    pendingVotes: Number(row.pendingVotes ?? row.pending_votes ?? 0),
    fraudFlaggedVotes: Number(
      row.fraudFlaggedVotes ?? row.fraud_flagged_votes ?? 0
    ),
  };
}

function normalizeSystemEvent(row: Record<string, unknown>, fallbackId: string): SystemEvent {
  const allowedTypes: SystemEvent['type'][] = [
    'fraud_alert',
    'payment_failure',
    'velocity_violation',
    'trust_score_drop',
    'webhook_failure',
    'system_error',
  ];
  const rawType = String(row.type || row.event_type || 'system_error');
  const mappedType = allowedTypes.includes(rawType as SystemEvent['type'])
    ? (rawType as SystemEvent['type'])
    : 'system_error';

  const allowedSeverities: SystemEvent['severity'][] = [
    'critical',
    'high',
    'medium',
    'low',
    'info',
  ];
  const rawSeverity = String(row.severity || row.level || 'info');
  const mappedSeverity = allowedSeverities.includes(rawSeverity as SystemEvent['severity'])
    ? (rawSeverity as SystemEvent['severity'])
    : 'info';

  return {
    id: String(row.id || fallbackId),
    type: mappedType,
    title: String(row.title || row.summary || row.message || 'System Event'),
    description: String(row.description || row.message || ''),
    severity: mappedSeverity,
    timestamp: String(row.timestamp || row.created_at || new Date().toISOString()),
    related:
      (row.related as SystemEvent['related']) || {
        eventName: typeof row.event_name === 'string' ? row.event_name : undefined,
        deviceId: typeof row.device_id === 'string' ? row.device_id : undefined,
        userId: typeof row.user_id === 'string' ? row.user_id : undefined,
      },
  };
}

export async function generateSystemMetrics(token?: string): Promise<SystemMetrics> {
  const dashboard = await apiFetch<any>('/admin/dashboard', {}, token).catch(() => null);
  if (!dashboard?.systemMetrics) return EMPTY_METRICS;

  const metrics = dashboard.systemMetrics as Record<string, unknown>;
  return {
    activeEvents: Number(metrics.activeEvents ?? 0),
    totalVotes: Number(metrics.totalVotes ?? 0),
    totalRevenue: Number(metrics.totalRevenue ?? 0),
    fraudReports: Number(metrics.fraudReports ?? 0),
    confirmedAnchors: Number(metrics.confirmedAnchors ?? 0),
    totalUsers: Number(metrics.totalUsers ?? 0),
    totalContestants: Number(metrics.totalContestants ?? 0),
    paidVotes: Number(metrics.paidVotes ?? 0),
  };
}

export async function generateVoteActivityData(
  range: '24h' | '7d',
  token?: string
): Promise<VoteActivityData> {
  const response = await apiFetch<any>(
    `/admin/dashboard/vote-activity?range=${range}`,
    {},
    token
  ).catch(() => null);
  const rows = Array.isArray(response) ? response : [];

  return {
    data: rows.map((row) => normalizeVoteActivityPoint(row)),
    range,
    lastUpdate: new Date().toISOString(),
  };
}

export async function generateRevenueAnalytics(token?: string): Promise<RevenueAnalytics> {
  const response = await apiFetch<any>('/admin/dashboard/revenue', {}, token).catch(() => null);
  if (!response) return EMPTY_REVENUE;

  const byProvider = Array.isArray(response.breakdown)
    ? response.breakdown.map((row: Record<string, unknown>) => ({
        provider: String(row.provider || 'manual'),
        amount: Number(row.amount ?? 0),
        percentage: Number(row.percentage ?? 0),
        transactionCount: Number(row.transactionCount ?? row.transaction_count ?? 0),
      }))
    : [];

  return {
    byProvider,
    trend: Array.isArray(response.trend)
      ? response.trend.map((row: Record<string, unknown>) => ({
          date: String(row.date || ''),
          revenue: Number(row.revenue ?? 0),
          transactions: Number(row.transactions ?? 0),
        }))
      : [],
    totalRevenue: Number(response.totalRevenue ?? 0),
    averageTransaction:
      Number(response.averageTransaction ?? response.average_transaction ?? 0),
  };
}

export async function generateFraudSummary(token?: string): Promise<FraudSummary> {
  const dashboard = await apiFetch<any>('/admin/dashboard', {}, token).catch(() => null);
  if (!dashboard?.fraudSummary) return EMPTY_FRAUD;
  const summary = dashboard.fraudSummary as Record<string, unknown>;

  const total = Number(summary.total ?? summary.totalCases ?? 0);
  const resolved = Number(summary.resolved ?? summary.resolvedCases ?? 0);
  const pending = Number(summary.pending ?? summary.openCases ?? 0);
  const critical = Number(summary.critical ?? 0);
  const high = Number(summary.high ?? 0);

  return {
    total,
    critical,
    high,
    pending,
    resolved,
    fraudVotesRemoved: Number(summary.fraudVotesRemoved ?? 0),
    criticalPercentage: total > 0 ? Number(((critical / total) * 100).toFixed(1)) : 0,
  };
}

export async function generateFraudAlerts(): Promise<FraudAlert[]> {
  const response = await fetchAdminData<Record<string, unknown>[]>(
    '/api/admin/system/fraud-alerts?page=1&limit=20'
  );
  const rows = Array.isArray(response.data) ? response.data : [];

  return rows.map((row, index) => ({
    id: String(row.id || `fraud-${index + 1}`),
    severity:
      (['critical', 'high', 'medium', 'low', 'info'] as const).includes(
        String(row.severity || row.level || 'info') as FraudAlert['severity']
      )
        ? (String(row.severity || row.level) as FraudAlert['severity'])
        : 'info',
    type: String(row.type || row.alert_type || 'Fraud Alert'),
    description: String(row.description || row.message || ''),
    timestamp: String(row.timestamp || row.created_at || new Date().toISOString()),
    status:
      (['pending', 'investigating', 'resolved'] as const).includes(
        String(row.status || 'pending') as FraudAlert['status']
      )
        ? (String(row.status) as FraudAlert['status'])
        : 'pending',
    eventName: typeof row.eventName === 'string' ? row.eventName : undefined,
  }));
}

export async function generateDeviceRiskOverview(): Promise<DeviceRiskOverview> {
  const response = await fetchAdminData<any>('/api/admin/system/device-risk');
  const payload = response.data as Record<string, unknown> | null;
  if (!payload) return EMPTY_DEVICE_RISK;

  return {
    highRiskDevices: Number(payload.highRiskDevices ?? payload.high_risk_devices ?? 0),
    botFlaggedDevices: Number(payload.botFlaggedDevices ?? payload.bot_flagged_devices ?? 0),
    averageTrustScore: Number(payload.averageTrustScore ?? payload.average_trust_score ?? 0),
    riskDistribution: Array.isArray(payload.riskDistribution)
      ? payload.riskDistribution.map((row: Record<string, unknown>) => ({
          riskLevel:
            (['high', 'medium', 'low'] as const).includes(
              String(row.riskLevel || row.risk_level || 'low') as 'high' | 'medium' | 'low'
            )
              ? (String(row.riskLevel || row.risk_level) as 'high' | 'medium' | 'low')
              : 'low',
          count: Number(row.count ?? 0),
          percentage: Number(row.percentage ?? 0),
        }))
      : [],
  };
}

export async function generateBlockchainStatus(token?: string): Promise<BlockchainStatus> {
  const dashboard = await apiFetch<any>('/admin/dashboard', {}, token).catch(() => null);
  const directStatus = dashboard?.blockchainStatus as Record<string, unknown> | undefined;

  if (directStatus) {
    return {
      totalBatches: Number(directStatus.totalBatches ?? directStatus.totalAnchors ?? 0),
      confirmedAnchors: Number(
        directStatus.confirmedAnchors ?? directStatus.confirmed_batches ?? 0
      ),
      pendingAnchors: Number(directStatus.pendingAnchors ?? directStatus.pending_batches ?? 0),
      averageTimeToAnchor: Number(
        directStatus.averageTimeToAnchor ?? directStatus.avg_confirmation_seconds ?? 0
      ),
      networkUsed: String(directStatus.networkUsed ?? directStatus.network ?? 'N/A'),
      lastAnchorTime: String(
        directStatus.lastAnchorTime ??
          directStatus.last_anchor_at ??
          new Date().toISOString()
      ),
    };
  }

  const stats = await fetchAdminData<any>('/api/admin/blockchain/stats');
  const payload = (stats.data ?? {}) as Record<string, unknown>;
  return {
    totalBatches: Number(payload.total_batches ?? 0),
    confirmedAnchors: Number(payload.confirmed_batches ?? 0),
    pendingAnchors: Number(payload.pending_batches ?? 0),
    averageTimeToAnchor: Number(payload.avg_confirmation_seconds ?? 0),
    networkUsed: String(payload.network ?? payload.blockchain_network ?? 'N/A'),
    lastAnchorTime: String(payload.last_anchor_at ?? new Date().toISOString()),
  };
}

export async function generateSystemEventsFeed(
  page = 1,
  pageSize = 20
): Promise<SystemEventsResponse> {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(pageSize),
  });

  const response = await fetchAdminData<Record<string, unknown>[]>(
    `/api/admin/system/events?${query.toString()}`
  );

  const rows = Array.isArray(response.data) ? response.data : [];
  const pagination = (response.pagination || {}) as {
    total?: number;
    page?: number;
    limit?: number;
    pages?: number;
    total_pages?: number;
    totalPages?: number;
  };
  const total = Number(pagination.total ?? rows.length);
  const currentPage = Number(pagination.page ?? page);
  const limit = Number(pagination.limit ?? pageSize);
  const pages = Number(pagination.pages ?? pagination.total_pages ?? pagination.totalPages ?? 1);

  return {
    events: rows.map((row, index) => normalizeSystemEvent(row, `sys-${index + 1}`)),
    pagination: {
      total,
      page: currentPage,
      pageSize: limit,
      hasMore: currentPage < pages,
    },
  };
}

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
