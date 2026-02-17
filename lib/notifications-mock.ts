const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
const MODULES = ['Votes', 'Payments', 'Security', 'Blockchain', 'Users'] as const;
const TYPES = ['SYSTEM', 'SECURITY', 'PAYMENT', 'FRAUD', 'INFO'] as const;

function randomItem<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateNotifications(count = 50) {
  return Array.from({ length: count }, (_, i) => {
    const status = i % 6 === 0 ? 'RESOLVED' : i % 3 === 0 ? 'READ' : 'NEW';

    return {
      id: `NTF-${String(10000 + i)}`,
      type: randomItem(TYPES),
      severity: i % 10 === 0 ? 'CRITICAL' : randomItem(SEVERITIES),
      title: `System alert ${i + 1}`,
      module: randomItem(MODULES),
      triggeredBy: i % 4 === 0 ? 'system' : `admin_${(i % 8) + 1}`,
      createdAt: new Date(Date.now() - i * 11 * 60 * 1000).toISOString(),
      status,
      readAt: status === 'READ' || status === 'RESOLVED' ? new Date() : null,
      acknowledgedAt: status === 'RESOLVED' ? new Date() : null,
    };
  });
}

export function generateAlertRules(count = 10) {
  return Array.from({ length: count }, (_, i) => ({
    id: `RULE-${i + 1}`,
    name: `Alert Rule ${i + 1}`,
    module: randomItem(MODULES),
    triggerCondition: i % 2 === 0 ? 'Error rate > 3%' : 'Latency > 2s',
    severity: randomItem(SEVERITIES),
    enabled: i % 4 !== 0,
    channels: i % 2 === 0 ? ['EMAIL', 'IN_APP'] : ['IN_APP', 'WEBHOOK'],
    lastTriggered: i % 3 === 0 ? null : new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
  }));
}

export function generateDeliveryLogs(count = 30) {
  return Array.from({ length: count }, (_, i) => ({
    id: `DLV-${String(20000 + i)}`,
    notificationId: `NTF-${String(10000 + (i % 20))}`,
    channel: ['EMAIL', 'SMS', 'IN_APP', 'WEBHOOK'][i % 4],
    recipient: i % 2 === 0 ? `user${i}@example.com` : `+1555000${String(i).padStart(3, '0')}`,
    status: i % 7 === 0 ? 'FAILED' : 'DELIVERED',
    retryCount: i % 7 === 0 ? 2 : 0,
    createdAt: new Date(Date.now() - i * 9 * 60 * 1000).toISOString(),
  }));
}

export function generateTemplates() {
  return [
    {
      id: 'TPL-1',
      name: 'Critical Alert',
      version: '2.1.0',
      subject: '[Critical] {{module}} incident detected',
      variables: ['module', 'severity', 'timestamp'],
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'TPL-2',
      name: 'Payment Failure',
      version: '1.4.3',
      subject: 'Payment delivery failure: {{transactionId}}',
      variables: ['transactionId', 'reason', 'amount'],
      updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
  ];
}

export function generateWebhookIntegrations() {
  return [
    {
      id: 'WH-1',
      name: 'PagerDuty Alerts',
      url: 'https://events.pagerduty.com/v2/enqueue',
      enabled: true,
      eventTypes: ['CRITICAL', 'HIGH'],
      retryPolicy: {
        maxRetries: 3,
        retryDelayMs: 2000,
      },
      timeout: 5000,
    },
    {
      id: 'WH-2',
      name: 'Internal SIEM',
      url: 'https://siem.internal.example/webhook',
      enabled: false,
      eventTypes: ['SECURITY', 'FRAUD', 'PAYMENT'],
      retryPolicy: {
        maxRetries: 5,
        retryDelayMs: 1500,
      },
      timeout: 7000,
    },
  ];
}

export function getNotificationStats() {
  const notifications = generateNotifications(80);

  return {
    totalToday: notifications.length,
    newCount: notifications.filter((n) => n.status === 'NEW').length,
    criticalCount: notifications.filter((n) => n.severity === 'CRITICAL').length,
    unresolvedCount: notifications.filter((n) => n.status !== 'RESOLVED').length,
    failedDeliveries: generateDeliveryLogs(40).filter((d) => d.status === 'FAILED').length,
  };
}
