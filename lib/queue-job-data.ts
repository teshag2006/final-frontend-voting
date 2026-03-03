export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleString();
}

export function getQueueDisplayName(queueName: string): string {
  const map: Record<string, string> = {
    fraud_check: 'Fraud Check Queue',
    payment_webhooks: 'Payment Webhooks',
    blockchain_anchor: 'Blockchain Anchor',
    notification_delivery: 'Notification Delivery',
  };
  return map[queueName] ?? queueName;
}

export function getJobTypeDisplayName(jobType: string): string {
  const map: Record<string, string> = {
    FRAUD_SCAN: 'Fraud Scan',
    PAYMENT_RECONCILE: 'Payment Reconcile',
    ANCHOR_BATCH: 'Anchor Batch',
    NOTIFY: 'Notify',
  };
  return map[jobType] ?? jobType;
}
