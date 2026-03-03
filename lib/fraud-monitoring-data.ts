import { FraudCase } from '@/components/admin/fraud-cases-table';
import { fetchAdminData } from '@/lib/admin-data-client';

export interface FraudSummaryMetrics {
  flaggedTransactions: number;
  highRiskVotes: number;
  blockedIPs: number;
  suspiciousDevices: number;
  manualOverrides: number;
  averageFraudScore: number;
  changes: {
    flaggedTransactions: number;
    highRiskVotes: number;
    blockedIPs: number;
    suspiciousDevices: number;
  };
}

type BackendFraudRow = {
  id?: string | number;
  case_id?: string;
  type?: string;
  user_id?: string;
  contestant?: string;
  event?: string;
  risk_score?: number;
  ip_address?: string;
  device_fingerprint?: string;
  status?: string;
  created_at?: string;
  metadata?: Record<string, unknown>;
};

function toRiskLevel(score: number): FraudCase['riskLevel'] {
  if (score >= 90) return 'CRITICAL';
  if (score >= 70) return 'HIGH';
  if (score >= 40) return 'MEDIUM';
  return 'LOW';
}

function toStatus(value: unknown): FraudCase['status'] {
  const raw = String(value || '').toLowerCase();
  if (raw === 'reviewed') return 'REVIEWED';
  if (raw === 'blocked') return 'BLOCKED';
  if (raw === 'overridden') return 'OVERRIDDEN';
  return 'OPEN';
}

function toType(value: unknown): FraudCase['type'] {
  const raw = String(value || '').toLowerCase();
  if (raw.includes('payment')) return 'PAYMENT';
  if (raw.includes('login')) return 'LOGIN';
  return 'VOTE';
}

export async function generateMockFraudCases(count: number = 50): Promise<FraudCase[]> {
  const query = new URLSearchParams({ page: '1', limit: String(Math.max(1, count)) });
  const response = await fetchAdminData<BackendFraudRow[]>(
    `/api/admin/system/fraud-alerts?${query.toString()}`
  );
  const rows = Array.isArray(response.data) ? response.data : [];

  return rows.map((row, index) => {
    const riskScore = Number(row.risk_score ?? 0);
    return {
      id: String(row.id ?? `case_${index + 1}`),
      caseId: String(row.case_id ?? row.id ?? `CASE-${index + 1}`),
      type: toType(row.type),
      userId: String(row.user_id ?? `USR-${index + 1}`),
      contestant: row.contestant || undefined,
      event: String(row.event ?? 'Unknown Event'),
      riskScore,
      riskLevel: toRiskLevel(riskScore),
      ipAddress: String(row.ip_address ?? '0.0.0.0'),
      deviceFingerprint: String(row.device_fingerprint ?? ''),
      status: toStatus(row.status),
      timestamp: String(row.created_at ?? new Date().toISOString()),
      metadata: {
        ...(row.metadata || {}),
      },
    } as FraudCase;
  });
}

export function calculateFraudSummary(cases: FraudCase[]): FraudSummaryMetrics {
  const openCases = cases.filter((c) => c.status === 'OPEN');
  const highRiskVotes = cases.filter((c) => c.type === 'VOTE' && c.riskLevel === 'CRITICAL');
  const blockedCases = cases.filter((c) => c.status === 'BLOCKED');
  const overriddenCases = cases.filter((c) => c.status === 'OVERRIDDEN');

  const uniqueDevices = new Set(cases.map((c) => c.deviceFingerprint));
  const uniqueIPs = new Set(blockedCases.map((c) => c.ipAddress));

  const avgScore =
    cases.length > 0
      ? Math.round(cases.reduce((sum, c) => sum + c.riskScore, 0) / cases.length)
      : 0;

  return {
    flaggedTransactions: openCases.length,
    highRiskVotes: highRiskVotes.length,
    blockedIPs: uniqueIPs.size,
    suspiciousDevices: uniqueDevices.size,
    manualOverrides: overriddenCases.length,
    averageFraudScore: avgScore,
    changes: {
      flaggedTransactions: 0,
      highRiskVotes: 0,
      blockedIPs: 0,
      suspiciousDevices: 0,
    },
  };
}

export function filterFraudCases(
  cases: FraudCase[],
  filters: {
    riskLevel?: string;
    status?: string;
    fraudType?: string;
    event?: string;
    dateFrom?: string;
    dateTo?: string;
    ipAddress?: string;
    deviceId?: string;
    searchQuery?: string;
  }
): FraudCase[] {
  return cases.filter((fraudCase) => {
    if (filters.riskLevel && fraudCase.riskLevel !== filters.riskLevel) return false;
    if (filters.status && fraudCase.status !== filters.status) return false;
    if (filters.fraudType && fraudCase.type !== filters.fraudType) return false;
    if (filters.event && fraudCase.event !== filters.event) return false;

    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      if (new Date(fraudCase.timestamp) < fromDate) return false;
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      if (new Date(fraudCase.timestamp) > toDate) return false;
    }

    if (filters.ipAddress && !fraudCase.ipAddress.includes(filters.ipAddress)) return false;
    if (filters.deviceId && !fraudCase.deviceFingerprint.includes(filters.deviceId)) return false;

    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      return (
        fraudCase.caseId.toLowerCase().includes(q) ||
        fraudCase.userId.toLowerCase().includes(q) ||
        fraudCase.ipAddress.includes(q) ||
        fraudCase.deviceFingerprint.toLowerCase().includes(q)
      );
    }

    return true;
  });
}

export function sortFraudCases(
  cases: FraudCase[],
  sortBy: string = 'timestamp',
  sortOrder: 'asc' | 'desc' = 'desc'
): FraudCase[] {
  const sorted = [...cases].sort((a, b) => {
    let aVal: any = a[sortBy as keyof FraudCase];
    let bVal: any = b[sortBy as keyof FraudCase];

    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = (bVal as string).toLowerCase();
    }

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return sorted;
}

export function paginateFraudCases(
  cases: FraudCase[],
  page: number = 1,
  pageSize: number = 10
) {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return {
    items: cases.slice(start, end),
    total: cases.length,
    pages: Math.ceil(cases.length / pageSize),
    currentPage: page,
    pageSize,
  };
}

export function getEventOptions(cases: FraudCase[] = []): string[] {
  return Array.from(new Set(cases.map((row) => row.event))).sort();
}

export function getFraudTypeOptions(): Array<{ value: string; label: string }> {
  return [
    { value: 'VOTE', label: 'Vote' },
    { value: 'PAYMENT', label: 'Payment' },
    { value: 'LOGIN', label: 'Login' },
  ];
}
