import { fetchAdminData } from '@/lib/admin-data-client';

function toRiskLevel(value: unknown): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  const raw = String(value || '').toLowerCase();
  if (raw === 'critical') return 'CRITICAL';
  if (raw === 'high') return 'HIGH';
  if (raw === 'medium') return 'MEDIUM';
  return 'LOW';
}

function toStatus(value: unknown): 'SUCCESS' | 'FAILED' {
  const raw = String(value || '').toLowerCase();
  return raw === 'failed' ? 'FAILED' : 'SUCCESS';
}

export async function generateAuditLogs(count = 50) {
  const query = new URLSearchParams({ page: '1', limit: String(count) });
  const response = await fetchAdminData<any[]>(`/api/admin/audit?${query.toString()}`);
  const rows = Array.isArray(response.data) ? response.data : [];

  return rows.map((row, index) => ({
    id: String(row.id ?? `audit-${index + 1}`),
    logId: String(row.id ?? row.log_id ?? `LOG-${index + 1}`),
    timestamp: String(row.created_at ?? row.timestamp ?? new Date().toISOString()),
    actorName: String(row.admin_name ?? row.actor_name ?? row.user_name ?? 'Admin'),
    actorRole: String(row.admin_role ?? row.actor_role ?? 'ADMIN').toUpperCase(),
    actionType: String(row.action ?? row.action_type ?? 'UPDATE').toUpperCase(),
    module: String(row.entity_type ?? row.module ?? 'SYSTEM'),
    resourceType: String(row.entity_type ?? row.resource_type ?? 'SYSTEM').toUpperCase(),
    resourceId: String(row.entity_id ?? row.resource_id ?? ''),
    description: String(row.note ?? row.description ?? row.action ?? 'Audit action'),
    ipAddress: String(row.ip_address ?? row.ipAddress ?? '0.0.0.0'),
    userAgent: String(row.user_agent ?? row.userAgent ?? ''),
    status: toStatus(row.status),
    riskLevel: toRiskLevel(row.severity ?? row.risk_level ?? row.riskLevel),
    correlationId: String(row.correlation_id ?? row.correlationId ?? ''),
    requestId: String(row.request_id ?? row.requestId ?? ''),
    beforeState: row.before_state ?? row.beforeState,
    afterState: row.after_state ?? row.afterState,
    fraudScore:
      row.fraud_score !== undefined && row.fraud_score !== null
        ? Number(row.fraud_score)
        : undefined,
  }));
}

export async function getAuditLogSummary() {
  const logs = await generateAuditLogs(200);
  return {
    totalLogsToday: logs.length,
    securityEvents: logs.filter((l) => l.riskLevel === 'HIGH' || l.riskLevel === 'CRITICAL').length,
    failedOperations: logs.filter((l) => l.status === 'FAILED').length,
    roleChanges: logs.filter((l) => l.actionType.includes('ROLE')).length,
    paymentActions: logs.filter((l) => l.module.toLowerCase().includes('payment')).length,
    blockchainEvents: logs.filter((l) => l.module.toLowerCase().includes('blockchain')).length,
  };
}
