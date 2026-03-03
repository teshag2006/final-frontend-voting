const QUEUE_NAMES = ['fraud_check', 'payment_webhooks', 'blockchain_anchor', 'notification_delivery'] as const;
const JOB_TYPES = ['FRAUD_SCAN', 'PAYMENT_RECONCILE', 'ANCHOR_BATCH', 'NOTIFY'] as const;

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function id(prefix: string, i: number): string {
  return `${prefix}_${(100000 + i).toString(16)}_${randomInt(1000, 9999)}`;
}

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

export function generateActiveJobsList(count = 8) {
  return Array.from({ length: count }, (_, i) => ({
    id: id('job', i),
    queueName: randomItem(QUEUE_NAMES),
    jobType: randomItem(JOB_TYPES),
    status: i % 4 === 0 ? 'WAITING' : i % 3 === 0 ? 'DELAYED' : 'ACTIVE',
    priority: i % 8 === 0 ? 'CRITICAL' : i % 3 === 0 ? 'HIGH' : 'NORMAL',
    attempts: randomInt(0, 2),
    maxRetries: 3,
    startedAt: new Date(Date.now() - randomInt(5, 900) * 1000),
  }));
}

export function generateFailedJobsList(count = 12) {
  const reasons = ['Timeout', 'Upstream 502', 'Validation error', 'Rate limited'];
  return Array.from({ length: count }, (_, i) => ({
    id: id('failed', i),
    queueName: randomItem(QUEUE_NAMES),
    jobType: randomItem(JOB_TYPES),
    status: 'FAILED',
    attempts: randomInt(1, 3),
    maxRetries: 3,
    failureReason: randomItem(reasons),
    failedAt: new Date(Date.now() - i * 12 * 60 * 1000),
  }));
}

export function generateCompletedJobsList(count = 15) {
  return Array.from({ length: count }, (_, i) => ({
    id: id('done', i),
    queueName: randomItem(QUEUE_NAMES),
    jobType: randomItem(JOB_TYPES),
    status: 'COMPLETED',
    completedAt: new Date(Date.now() - i * 7 * 60 * 1000),
    duration: randomInt(800, 65000),
    resultSummary: i % 4 === 0 ? 'Completed with warnings' : 'Completed successfully',
  }));
}

export function generateDLQJobsList(count = 3) {
  return Array.from({ length: count }, (_, i) => ({
    id: id('dlq', i),
    queueName: randomItem(QUEUE_NAMES),
    jobType: randomItem(JOB_TYPES),
    failureReason: ['Max retries exceeded', 'Invalid payload', 'Poison message'][i % 3],
    retryAttempts: 3,
    maxRetries: 3,
    failedAt: new Date(Date.now() - i * 70 * 60 * 1000),
  }));
}

export function generateQueueMetrics() {
  return QUEUE_NAMES.map((queueName, i) => ({
    queueName,
    jobCount: randomInt(0, 120),
    failureRate: randomInt(1, 15),
    processingRate: randomInt(12, 180),
    averageDuration: randomInt(1, 30),
    workerCount: randomInt(1, 8),
    backlogSize: randomInt(0, 180),
    totalProcessed24h: randomInt(2000, 40000),
    totalFailed24h: randomInt(0, 1800),
  }));
}

export function generateJobsOverTimeData(points = 24) {
  const now = Date.now();
  return Array.from({ length: points }, (_, i) => ({
    timestamp: new Date(now - (points - 1 - i) * 60 * 60 * 1000),
    processed: randomInt(50, 300),
    failed: randomInt(0, 30),
    active: randomInt(10, 90),
  }));
}

export function generateProcessingLatencyData(points = 24) {
  const now = Date.now();
  return Array.from({ length: points }, (_, i) => ({
    timestamp: new Date(now - (points - 1 - i) * 60 * 60 * 1000),
    latency: randomInt(80, 2400),
  }));
}
