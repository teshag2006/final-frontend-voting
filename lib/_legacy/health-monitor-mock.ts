function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateSystemHealthOverview() {
  return {
    status: 'HEALTHY',
    apiUptime: 99.97,
    environment: 'PROD',
    version: '1.1.0',
    lastDeployment: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    servicesHealthy: 7,
    servicesDegraded: 1,
    servicesDown: 0,
  };
}

export function generateCoreServices() {
  return [
    {
      id: 'svc-api',
      name: 'API Gateway',
      status: 'UP',
      responseTime: randomInt(40, 180),
      uptime: 99.99,
      errorCount: 0,
      lastChecked: new Date(Date.now() - 9000).toISOString(),
    },
    {
      id: 'svc-db',
      name: 'PostgreSQL',
      status: 'UP',
      responseTime: randomInt(8, 30),
      uptime: 99.98,
      errorCount: 1,
      lastChecked: new Date(Date.now() - 7000).toISOString(),
    },
    {
      id: 'svc-redis',
      name: 'Redis Cache',
      status: 'DEGRADED',
      responseTime: randomInt(110, 450),
      uptime: 99.5,
      errorCount: 12,
      lastChecked: new Date(Date.now() - 11000).toISOString(),
    },
  ];
}

export function generateExternalIntegrations() {
  return [
    {
      id: 'int-stripe',
      name: 'Stripe',
      status: 'UP',
      latency: randomInt(90, 260),
      lastSuccess: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
      failureCount24h: 2,
      failureRate: 0.4,
    },
    {
      id: 'int-paypal',
      name: 'PayPal',
      status: 'DEGRADED',
      latency: randomInt(350, 1400),
      lastSuccess: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
      failureCount24h: 17,
      failureRate: 3.7,
    },
    {
      id: 'int-chain',
      name: 'Blockchain RPC',
      status: 'UP',
      latency: randomInt(140, 380),
      lastSuccess: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
      failureCount24h: 4,
      failureRate: 0.9,
    },
  ];
}

export function generateResourceMetrics() {
  const cpuHistory = Array.from({ length: 24 }, () => randomInt(24, 88));
  const memoryHistory = Array.from({ length: 24 }, () => randomInt(30, 92));
  const connectionHistory = Array.from({ length: 24 }, () => randomInt(900, 4200));

  return {
    cpu: { current: cpuHistory[cpuHistory.length - 1], avg: 58, peak: 91 },
    memory: { current: memoryHistory[memoryHistory.length - 1], avg: 62, peak: 95 },
    disk: { current: 68, avg: 64, peak: 79 },
    connections: { active: 1430, total: 3000, percentage: 48 },
    dbPoolUsage: { active: 58, total: 100, percentage: 58 },
    redisMemory: { used: 1200, total: 2048, percentage: 59 },
    cpuHistory,
    memoryHistory,
    connectionHistory,
  };
}

export function generateWebhookStatus() {
  return [
    {
      id: 'wh-1',
      name: 'Vote Callback',
      source: 'Voting Engine',
      status: 'SUCCESS',
      responseCode: 200,
      latency: randomInt(80, 230),
      retryCount: 0,
      timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    },
    {
      id: 'wh-2',
      name: 'Payment Confirm',
      source: 'Payment Service',
      status: 'RETRY',
      responseCode: 429,
      latency: randomInt(200, 900),
      retryCount: 2,
      timestamp: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    },
    {
      id: 'wh-3',
      name: 'Anchor Receipt',
      source: 'Blockchain Service',
      status: 'FAILED',
      responseCode: 500,
      latency: randomInt(150, 700),
      retryCount: 3,
      timestamp: new Date(Date.now() - 39 * 60 * 1000).toISOString(),
    },
  ];
}
