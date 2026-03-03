import { fetchAdminData } from '@/lib/admin-data-client';

type VoteRow = {
  id?: string | number;
  vote_id?: string;
  created_at?: string;
  contestant_id?: string | number;
  ip_address?: string;
  payment_status?: string;
  vote_count?: number;
  fraud_score?: number;
  source?: string;
};

type FraudAlertRow = {
  id?: string | number;
  type?: string;
  severity?: string;
  description?: string;
  affected_count?: number;
  created_at?: string;
  reviewed?: boolean;
};

type DeviceRiskRow = {
  ip_address?: string;
  risk_level?: string;
  vote_count?: number;
  time_window?: number;
  blocked?: boolean;
};

function toPaymentStatus(value: unknown): 'PAID' | 'PENDING' | 'FAILED' | 'FLAGGED' {
  const raw = String(value || '').toLowerCase();
  if (raw === 'paid' || raw === 'completed' || raw === 'success') return 'PAID';
  if (raw === 'failed' || raw === 'error') return 'FAILED';
  if (raw === 'flagged' || raw === 'review') return 'FLAGGED';
  return 'PENDING';
}

function toSource(value: unknown): 'WEB' | 'MOBILE' | 'API' {
  const raw = String(value || '').toLowerCase();
  if (raw === 'mobile') return 'MOBILE';
  if (raw === 'api') return 'API';
  return 'WEB';
}

export async function generateMockVotes(count = 50) {
  const query = new URLSearchParams({ page: '1', limit: String(Math.max(1, count)) });
  const response = await fetchAdminData<VoteRow[]>(
    `/api/admin/system/votes?${query.toString()}`
  );
  const rows = Array.isArray(response.data) ? response.data : [];

  return rows.map((row, index) => {
    const fraudScore = Number(row.fraud_score ?? 0);
    const status = fraudScore > 80 ? 'BLOCKED' : fraudScore > 55 ? 'FLAGGED' : 'VALID';

    return {
      voteId: String(row.vote_id ?? row.id ?? `VOTE-${index + 1}`),
      timestamp: String(row.created_at ?? new Date().toISOString()),
      contestantId: String(row.contestant_id ?? `contestant_${index + 1}`),
      voterIp: String(row.ip_address ?? '0.0.0.0'),
      paymentStatus: toPaymentStatus(row.payment_status),
      voteCount: Number(row.vote_count ?? 1),
      fraudScore,
      status,
      source: toSource(row.source),
    };
  });
}

export async function getVoteStats() {
  const votes = await generateMockVotes(160);
  return {
    totalVotesToday: votes.reduce((sum, v) => sum + v.voteCount, 0),
    votesLast10Min: votes.slice(0, 7).reduce((sum, v) => sum + v.voteCount, 0),
    pendingPayments: votes.filter((v) => v.paymentStatus === 'PENDING').length,
    failedTransactions: votes.filter((v) => v.paymentStatus === 'FAILED').length,
    flaggedSuspiciousVotes: votes.filter((v) => v.fraudScore > 70).length,
  };
}

export async function generateMockFraudAlerts(count = 8) {
  const query = new URLSearchParams({ page: '1', limit: String(Math.max(1, count)) });
  const response = await fetchAdminData<FraudAlertRow[]>(
    `/api/admin/system/fraud-alerts?${query.toString()}`
  );
  const rows = Array.isArray(response.data) ? response.data : [];
  return rows.map((row, index) => ({
    alertId: String(row.id ?? `ALERT-${index + 1}`),
    type: String(row.type ?? 'FRAUD_ALERT'),
    severity: String(row.severity ?? 'MEDIUM'),
    description: String(row.description ?? 'Fraud anomaly detected'),
    affectedCount: Number(row.affected_count ?? 0),
    timestamp: String(row.created_at ?? new Date().toISOString()),
    reviewed: Boolean(row.reviewed),
  }));
}

export async function generateMockSuspiciousIps(count = 5) {
  const query = new URLSearchParams({ page: '1', limit: String(Math.max(1, count)) });
  const response = await fetchAdminData<DeviceRiskRow[]>(
    `/api/admin/system/device-risk?${query.toString()}`
  );
  const rows = Array.isArray(response.data) ? response.data : [];
  return rows.map((row) => ({
    ipAddress: String(row.ip_address ?? '0.0.0.0'),
    riskLevel: String(row.risk_level ?? 'LOW'),
    voteCount: Number(row.vote_count ?? 0),
    timeWindow: Number(row.time_window ?? 0),
    blocked: Boolean(row.blocked),
  }));
}

export async function generateMockPaymentGatewayAlerts() {
  const response = await fetchAdminData<any[]>('/api/admin/system/payments?page=1&limit=200');
  const rows = Array.isArray(response.data) ? response.data : [];
  const gatewayStats = new Map<string, { total: number; failed: number }>();

  for (const row of rows) {
    const provider = String(row.gateway || 'Unknown');
    const status = String(row.status || '').toLowerCase();
    const current = gatewayStats.get(provider) || { total: 0, failed: 0 };
    current.total += 1;
    if (status === 'failed' || status === 'error') current.failed += 1;
    gatewayStats.set(provider, current);
  }

  return Array.from(gatewayStats.entries()).map(([provider, stats]) => {
    const failureRatio = stats.total > 0 ? stats.failed / stats.total : 0;
    return {
      provider,
      status: failureRatio > 0.2 ? 'DEGRADED' : 'HEALTHY',
      latencyMs: failureRatio > 0.2 ? 1200 : 180,
    };
  });
}
