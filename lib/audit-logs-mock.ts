const AUDIT_ACTIONS = [
  'LOGIN',
  'LOGOUT',
  'ROLE_CHANGE',
  'PAYMENT_REFUND',
  'VOTE_ADJUSTMENT',
  'SETTINGS_UPDATE',
  'ANCHOR_RETRY',
] as const;

const MODULES = ['Auth', 'Users', 'Payments', 'Votes', 'Settings', 'Blockchain'] as const;
const ROLES = ['SUPER_ADMIN', 'ADMIN', 'ANALYST', 'MODERATOR'] as const;
const RISK_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;

function randomItem<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomHex(length: number): string {
  const chars = 'abcdef0123456789';
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

function randomIp(): string {
  return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

export function generateAuditLogs(count = 50) {
  const now = Date.now();

  return Array.from({ length: count }, (_, i) => {
    const status = Math.random() > 0.15 ? 'SUCCESS' : 'FAILED';
    const module = randomItem(MODULES);
    const actionType = randomItem(AUDIT_ACTIONS);
    const riskLevel =
      status === 'FAILED' && Math.random() > 0.5
        ? 'HIGH'
        : randomItem(RISK_LEVELS);

    return {
      id: `audit_${i + 1}`,
      logId: `LOG-${String(100000 + i)}`,
      timestamp: new Date(now - i * 7 * 60 * 1000).toISOString(),
      actorName: `Admin ${((i % 9) + 1).toString()}`,
      actorRole: randomItem(ROLES),
      actionType,
      module,
      resourceType: module.toUpperCase(),
      resourceId: `${module.slice(0, 3).toUpperCase()}-${String(2000 + i)}`,
      description: `${actionType} executed in ${module}`,
      ipAddress: randomIp(),
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      status,
      riskLevel,
      correlationId: `corr_${randomHex(16)}`,
      requestId: `req_${randomHex(14)}`,
      beforeState: i % 3 === 0 ? { enabled: false } : undefined,
      afterState: i % 3 === 0 ? { enabled: true } : undefined,
      fraudScore: status === 'FAILED' ? Math.floor(50 + Math.random() * 50) : undefined,
    };
  });
}

export function getAuditLogSummary() {
  const logs = generateAuditLogs(120);

  return {
    totalLogsToday: logs.length,
    securityEvents: logs.filter((l) => l.module === 'Auth' || l.riskLevel === 'CRITICAL').length,
    failedOperations: logs.filter((l) => l.status === 'FAILED').length,
    roleChanges: logs.filter((l) => l.actionType === 'ROLE_CHANGE').length,
    paymentActions: logs.filter((l) => l.module === 'Payments').length,
    blockchainEvents: logs.filter((l) => l.module === 'Blockchain').length,
  };
}
