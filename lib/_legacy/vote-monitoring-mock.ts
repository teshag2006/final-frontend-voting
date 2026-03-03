const STATUSES = ['VALID', 'FLAGGED', 'BLOCKED'] as const;
const PAYMENT_STATUSES = ['PAID', 'PENDING', 'FAILED'] as const;
const SOURCES = ['WEB', 'MOBILE', 'API'] as const;
const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH'] as const;

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomIp(): string {
  return `${randomInt(10, 220)}.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(1, 254)}`;
}

export function generateMockVotes(count = 50) {
  const now = Date.now();

  return Array.from({ length: count }, (_, i) => {
    const fraudScore = Number((Math.random() * 100).toFixed(1));
    const status = fraudScore > 80 ? 'BLOCKED' : fraudScore > 55 ? 'FLAGGED' : 'VALID';

    return {
      voteId: `VOTE-${String(100000 + i)}`,
      timestamp: new Date(now - i * 90 * 1000).toISOString(),
      contestantId: `contestant_${(i % 24) + 1}`,
      voterIp: randomIp(),
      paymentStatus: randomItem(PAYMENT_STATUSES),
      voteCount: randomInt(1, 20),
      fraudScore,
      status,
      source: randomItem(SOURCES),
    };
  });
}

export function getVoteStats() {
  const votes = generateMockVotes(160);
  return {
    totalVotesToday: votes.reduce((sum, v) => sum + v.voteCount, 0),
    votesLast10Min: votes.slice(0, 7).reduce((sum, v) => sum + v.voteCount, 0),
    pendingPayments: votes.filter((v) => v.paymentStatus === 'PENDING').length,
    failedTransactions: votes.filter((v) => v.paymentStatus === 'FAILED').length,
    flaggedSuspiciousVotes: votes.filter((v) => v.fraudScore > 70).length,
  };
}

export function generateMockFraudAlerts(count = 8) {
  return Array.from({ length: count }, (_, i) => ({
    alertId: `ALERT-${i + 1}`,
    type: ['VELOCITY_SPIKE', 'IP_CLUSTER', 'ANOMALOUS_PATTERN'][i % 3],
    severity: randomItem(SEVERITIES),
    description: i % 2 === 0 ? 'Abnormal voting velocity detected' : 'Repeated suspicious pattern detected',
    affectedCount: randomInt(3, 240),
    timestamp: new Date(Date.now() - i * 8 * 60 * 1000).toISOString(),
    reviewed: i % 4 === 0,
  }));
}

export function generateMockSuspiciousIps(count = 5) {
  return Array.from({ length: count }, (_, i) => ({
    ipAddress: randomIp(),
    riskLevel: i % 3 === 0 ? 'HIGH' : i % 2 === 0 ? 'MEDIUM' : 'LOW',
    voteCount: randomInt(40, 700),
    timeWindow: randomInt(30, 300),
    blocked: i % 4 === 0,
  }));
}

export function generateMockPaymentGatewayAlerts() {
  return [
    { provider: 'Stripe', status: 'HEALTHY', latencyMs: 180 },
    { provider: 'PayPal', status: 'DEGRADED', latencyMs: 1300 },
    { provider: 'Crypto', status: 'HEALTHY', latencyMs: 250 },
  ];
}
