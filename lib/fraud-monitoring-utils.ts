/**
 * Fraud Monitoring Utility Functions
 */

export function formatIP(ip: string): string {
  if (!ip) return '—';
  const parts = ip.split('.');
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.*.* `;
  }
  return ip;
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getRiskLevelFromScore(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  if (score <= 30) return 'LOW';
  if (score <= 60) return 'MEDIUM';
  if (score <= 80) return 'HIGH';
  return 'CRITICAL';
}

export function getChangeDirection(current: number, previous: number): 'up' | 'down' {
  return current > previous ? 'up' : 'down';
}

export function getChangePercentage(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

/**
 * Fraud risk scoring factors (for reference)
 */
export const FRAUD_RISK_FACTORS = {
  VOTE_FREQUENCY: { min: 0, max: 20, label: 'Vote frequency' },
  IP_REPUTATION: { min: 0, max: 15, label: 'IP reputation' },
  DEVICE_DUPLICATION: { min: 0, max: 20, label: 'Device duplication' },
  PAYMENT_MISMATCH: { min: 0, max: 15, label: 'Payment mismatch' },
  GEO_INCONSISTENCY: { min: 0, max: 15, label: 'Geo inconsistency' },
  PROXY_DETECTION: { min: 0, max: 15, label: 'Proxy detection' },
} as const;

export function calculateTotalMaxScore(): number {
  return Object.values(FRAUD_RISK_FACTORS).reduce((sum, factor) => sum + factor.max, 0);
}
