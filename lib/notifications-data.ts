import { fetchAdminData } from '@/lib/admin-data-client';

function normalizeSeverity(value: unknown): string {
  const raw = String(value || '').toUpperCase();
  if (raw === 'CRITICAL' || raw === 'HIGH' || raw === 'MEDIUM' || raw === 'LOW') return raw;
  return 'MEDIUM';
}

async function loadRows(endpoint: string, count: number) {
  const query = new URLSearchParams({ page: '1', limit: String(Math.max(1, count)) });
  const response = await fetchAdminData<any[]>(`${endpoint}?${query.toString()}`);
  return Array.isArray(response.data) ? response.data : [];
}

export async function generateNotifications(count = 50) {
  const rows = await loadRows('/api/admin/system/notifications', count);
  return rows.map((row, index) => ({
    id: String(row.id ?? `NTF-${10000 + index}`),
    type: String(row.type ?? 'SYSTEM'),
    severity: normalizeSeverity(row.severity),
    title: String(row.title ?? 'System notification'),
    module: String(row.module ?? 'System'),
    triggeredBy: String(row.triggered_by ?? 'system'),
    createdAt: String(row.created_at ?? new Date().toISOString()),
    status: String(row.status ?? 'NEW'),
    readAt: row.read_at ? new Date(row.read_at) : null,
    acknowledgedAt: row.acknowledged_at ? new Date(row.acknowledged_at) : null,
  }));
}

export async function generateAlertRules(count = 10) {
  const rows = await loadRows('/api/admin/system/alert-rules', count);
  return rows.map((row, index) => ({
    id: String(row.id ?? `RULE-${index + 1}`),
    name: String(row.name ?? `Alert Rule ${index + 1}`),
    module: String(row.module ?? 'System'),
    triggerCondition: String(row.trigger_condition ?? 'Threshold reached'),
    severity: normalizeSeverity(row.severity),
    enabled: Boolean(row.enabled ?? true),
    channels: Array.isArray(row.channels) ? row.channels : ['IN_APP'],
    lastTriggered: row.last_triggered ?? null,
  }));
}

export async function generateDeliveryLogs(count = 30) {
  const rows = await loadRows('/api/admin/system/delivery-logs', count);
  return rows.map((row, index) => ({
    id: String(row.id ?? `DLV-${20000 + index}`),
    notificationId: String(row.notification_id ?? `NTF-${10000 + index}`),
    channel: String(row.channel ?? 'IN_APP'),
    recipient: String(row.recipient ?? 'unknown'),
    status: String(row.status ?? 'DELIVERED'),
    retryCount: Number(row.retry_count ?? 0),
    createdAt: String(row.created_at ?? new Date().toISOString()),
  }));
}

export async function generateTemplates() {
  const rows = await loadRows('/api/admin/system/notification-templates', 20);
  return rows.map((row, index) => ({
    id: String(row.id ?? `TPL-${index + 1}`),
    name: String(row.name ?? `Template ${index + 1}`),
    version: String(row.version ?? '1.0.0'),
    subject: String(row.subject ?? 'Notification'),
    variables: Array.isArray(row.variables) ? row.variables : [],
    updatedAt: String(row.updated_at ?? new Date().toISOString()),
  }));
}

export async function generateWebhookIntegrations() {
  const rows = await loadRows('/api/admin/system/webhooks', 20);
  return rows.map((row, index) => ({
    id: String(row.id ?? `WH-${index + 1}`),
    name: String(row.name ?? `Webhook ${index + 1}`),
    url: String(row.url ?? ''),
    enabled: Boolean(row.enabled ?? true),
    eventTypes: Array.isArray(row.event_types) ? row.event_types : [],
    retryPolicy: {
      maxRetries: Number(row.retry_max ?? 3),
      retryDelayMs: Number(row.retry_delay_ms ?? 2000),
    },
    timeout: Number(row.timeout_ms ?? 5000),
  }));
}

export async function getNotificationStats() {
  const notifications = await generateNotifications(80);
  const failedLogs = await generateDeliveryLogs(40);

  return {
    totalToday: notifications.length,
    newCount: notifications.filter((n) => n.status === 'NEW').length,
    criticalCount: notifications.filter((n) => n.severity === 'CRITICAL').length,
    unresolvedCount: notifications.filter((n) => n.status !== 'RESOLVED').length,
    failedDeliveries: failedLogs.filter((d) => d.status === 'FAILED').length,
  };
}
