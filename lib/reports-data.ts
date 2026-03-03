import { fetchAdminData } from '@/lib/admin-data-client';

export async function generateOverviewKPIs() {
  const [votesRes, paymentsRes, fraudRes, blockchainRes] = await Promise.all([
    fetchAdminData<any[]>('/api/admin/system/votes?page=1&limit=500'),
    fetchAdminData<any[]>('/api/admin/system/payments?page=1&limit=500'),
    fetchAdminData<any[]>('/api/admin/system/fraud-alerts?page=1&limit=500'),
    fetchAdminData<any>('/api/admin/blockchain/stats'),
  ]);

  const votes = Array.isArray(votesRes.data) ? votesRes.data : [];
  const payments = Array.isArray(paymentsRes.data) ? paymentsRes.data : [];
  const fraud = Array.isArray(fraudRes.data) ? fraudRes.data : [];
  const blockchain = blockchainRes.data ?? {};

  const totalVotes = votes.reduce((sum, row) => sum + Number(row.vote_count ?? 0), 0);
  const grossRevenue = payments
    .filter((row) => String(row.status || '').toLowerCase() === 'completed')
    .reduce((sum, row) => sum + Number(row.amount ?? 0), 0);
  const failedPayments = payments.filter(
    (row) => String(row.status || '').toLowerCase() === 'failed'
  ).length;
  const chargebackRate = payments.length > 0 ? (failedPayments / payments.length) * 100 : 0;

  return [
    { label: 'Total Votes', value: totalVotes.toLocaleString(), unit: 'votes', change: 0, changeType: 'increase' },
    { label: 'Gross Revenue', value: `$${grossRevenue.toLocaleString()}`, unit: 'USD', change: 0, changeType: 'increase' },
    { label: 'Conversion Rate', value: '0%', unit: 'users to payers', change: 0, changeType: 'decrease' },
    { label: 'Chargeback Rate', value: `${chargebackRate.toFixed(2)}%`, unit: 'payments', change: 0, changeType: 'decrease' },
    { label: 'Fraud Flags', value: String(fraud.length), unit: 'cases', change: 0, changeType: 'increase' },
    {
      label: 'Anchored Batches',
      value: String(Number(blockchain.total_batches ?? blockchain.anchored_batches ?? 0)),
      unit: 'batches',
      change: 0,
      changeType: 'increase',
    },
  ];
}

export async function generateChartData(days = 30) {
  const rowsRes = await fetchAdminData<any[]>(
    `/api/admin/system/monitoring-metrics?page=1&limit=${Math.max(30, days * 4)}`
  );
  const rows = Array.isArray(rowsRes.data) ? rowsRes.data : [];
  const grouped = new Map<string, { votes: number; revenue: number }>();

  for (const row of rows) {
    const day = String(row.collected_at ?? row.timestamp ?? new Date().toISOString()).slice(5, 10);
    const metric = String(row.metric_name ?? '').toLowerCase();
    const value = Number(row.metric_value ?? 0);
    const current = grouped.get(day) || { votes: 0, revenue: 0 };
    if (metric.includes('vote')) current.votes += value;
    if (metric.includes('revenue') || metric.includes('payment')) current.revenue += value;
    grouped.set(day, current);
  }

  const sortedDays = Array.from(grouped.keys()).sort().slice(-days);
  return sortedDays.map((day) => ({
    date: day,
    votes: grouped.get(day)?.votes || 0,
    revenue: grouped.get(day)?.revenue || 0,
    value: grouped.get(day)?.votes || 0,
  }));
}

export async function generateVoteAnalytics() {
  const votesRes = await fetchAdminData<any[]>('/api/admin/system/votes?page=1&limit=500');
  const rows = Array.isArray(votesRes.data) ? votesRes.data : [];
  const totalVotes = rows.reduce((sum, row) => sum + Number(row.vote_count ?? 0), 0);

  return {
    totalVotes,
    uniqueVoters: rows.length,
    averageVotesPerUser: rows.length > 0 ? totalVotes / rows.length : 0,
    topContestant: { name: 'N/A', votes: 0 },
    topCategory: { name: 'N/A', votes: 0 },
    suspiciousSpikes: rows.filter((row) => Number(row.fraud_score ?? 0) > 70).length,
    trendData: (await generateChartData(30)).map((d) => ({ date: d.date, votes: d.votes })),
  };
}

export async function generatePaymentMetrics() {
  const rowsRes = await fetchAdminData<any[]>('/api/admin/system/payments?page=1&limit=500');
  const rows = Array.isArray(rowsRes.data) ? rowsRes.data : [];
  const totalAmount = rows.reduce((sum, row) => sum + Number(row.amount ?? 0), 0);
  const successCount = rows.filter(
    (row) => String(row.status || '').toLowerCase() === 'completed'
  ).length;

  const providerMap = new Map<string, number>();
  for (const row of rows) {
    const key = String(row.gateway || 'Unknown');
    providerMap.set(key, (providerMap.get(key) || 0) + Number(row.amount ?? 0));
  }

  return {
    totalTransactions: rows.length,
    successRate: rows.length > 0 ? (successCount / rows.length) * 100 : 0,
    averageTicketSize: rows.length > 0 ? totalAmount / rows.length : 0,
    providers: Array.from(providerMap.entries()).map(([name, amount]) => ({ name, amount })),
  };
}

export async function generateFraudMetrics() {
  const rowsRes = await fetchAdminData<any[]>('/api/admin/system/fraud-alerts?page=1&limit=500');
  const rows = Array.isArray(rowsRes.data) ? rowsRes.data : [];
  const resolved = rows.filter((row) => String(row.status || '').toLowerCase() === 'reviewed').length;
  const critical = rows.filter((row) => String(row.severity || '').toLowerCase() === 'critical').length;

  return {
    totalCases: rows.length,
    resolvedCases: resolved,
    criticalCases: critical,
    votesRemoved: 0,
  };
}

export async function generateSystemLogs() {
  const response = await fetchAdminData<any[]>('/api/admin/audit?page=1&limit=100');
  const rows = Array.isArray(response.data) ? response.data : [];
  return rows.map((row, index) => ({
    id: String(row.id ?? `SYS-${index + 1}`),
    level: String(row.riskLevel ?? 'INFO'),
    message: String(row.details ?? row.action ?? 'System log'),
    timestamp: String(row.timestamp ?? new Date().toISOString()),
  }));
}
