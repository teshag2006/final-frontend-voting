import { FraudCase } from '@/components/admin/fraud-cases-table';
import { getRiskLevelFromScore, getChangePercentage } from './fraud-monitoring-utils';

const fraudTypes = ['VOTE', 'PAYMENT', 'LOGIN'] as const;
const caseStatuses = ['OPEN', 'REVIEWED', 'BLOCKED', 'OVERRIDDEN'] as const;
const events = ['Anderson Idol 2024', 'Summer Showdown 2023', 'Winter Finale 2023', 'Pandason'];
const categories = [
  'Solo Vocalists',
  'Duet Performers',
  'Youth Talent (Under 18)',
  'Group Acts',
];
const countries = ['US', 'UK', 'CA', 'AU', 'IN', 'SG', 'DE', 'FR', 'JP', 'BR'];

function generateMockIP(): string {
  const oct1 = Math.floor(Math.random() * 256);
  const oct2 = Math.floor(Math.random() * 256);
  const oct3 = Math.floor(Math.random() * 256);
  const oct4 = Math.floor(Math.random() * 256);
  return `${oct1}.${oct2}.${oct3}.${oct4}`;
}

function generateDeviceFingerprint(): string {
  const chars = 'abcdef0123456789';
  return Array.from({ length: 40 })
    .map(() => chars[Math.floor(Math.random() * chars.length)])
    .join('');
}

function generateMockUserId(): string {
  return `USR${Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, '0')}`;
}

function generateMockCaseId(): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${timestamp}${random}`.substring(0, 12);
}

export function generateMockFraudCases(count: number = 50): FraudCase[] {
  const cases: FraudCase[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const riskScore = Math.floor(Math.random() * 101);
    const riskLevel = getRiskLevelFromScore(riskScore);
    const fraudType = fraudTypes[Math.floor(Math.random() * fraudTypes.length)];
    const isOpen = Math.random() > 0.4;

    const timestamp = new Date(
      now.getTime() - Math.random() * 24 * 60 * 60 * 1000
    ).toISOString();

    cases.push({
      id: `case_${i}`,
      caseId: generateMockCaseId(),
      type: fraudType,
      userId: generateMockUserId(),
      contestant:
        fraudType !== 'LOGIN' ? categories[Math.floor(Math.random() * categories.length)] : undefined,
      event: events[Math.floor(Math.random() * events.length)],
      riskScore,
      riskLevel,
      ipAddress: generateMockIP(),
      deviceFingerprint: generateDeviceFingerprint(),
      status: isOpen ? 'OPEN' : caseStatuses[Math.floor(Math.random() * (caseStatuses.length - 1)) + 1],
      timestamp,
      metadata: {
        votingVelocity: fraudType === 'VOTE' ? Math.floor(Math.random() * 100) : undefined,
        ipGeoCountry: countries[Math.floor(Math.random() * countries.length)],
        deviceFingerprints: [generateDeviceFingerprint(), generateDeviceFingerprint()],
        previousFlags: Math.floor(Math.random() * 5),
        linkedVotes: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, () =>
          `VOTE${Math.floor(Math.random() * 1000000)}`
        ),
        linkedPayments: Array.from({ length: Math.floor(Math.random() * 3) }, () =>
          `PAY${Math.floor(Math.random() * 1000000)}`
        ),
        proxyDetected: Math.random() > 0.7,
      },
    });
  }

  return cases.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

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
      flaggedTransactions: getChangePercentage(openCases.length, 42),
      highRiskVotes: getChangePercentage(highRiskVotes.length, 18),
      blockedIPs: getChangePercentage(uniqueIPs.size, 12),
      suspiciousDevices: getChangePercentage(uniqueDevices.size, 38),
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

export function getEventOptions(): string[] {
  return events;
}

export function getFraudTypeOptions(): Array<{ value: string; label: string }> {
  return [
    { value: 'VOTE', label: 'Vote' },
    { value: 'PAYMENT', label: 'Payment' },
    { value: 'LOGIN', label: 'Login' },
  ];
}
