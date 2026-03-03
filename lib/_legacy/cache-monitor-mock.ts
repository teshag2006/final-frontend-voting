const KEY_TYPES = ['string', 'hash', 'list', 'set', 'zset'] as const;

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateRedisOverview() {
  const memoryLimit = 2 * 1024 * 1024 * 1024;
  const memoryUsage = randomInt(700, 1400) * 1024 * 1024;
  const hitRatio = Number((0.86 + Math.random() * 0.1).toFixed(3));

  return {
    status: 'HEALTHY',
    memoryUsage,
    memoryLimit,
    uptime: randomInt(50000, 600000),
    lastUpdated: new Date(),
    keyCount: randomInt(30000, 90000),
    connectedClients: randomInt(40, 220),
    hitRatio,
    missRatio: Number((1 - hitRatio).toFixed(3)),
    evictedKeys: randomInt(0, 1200),
  };
}

export function generateCacheKeys(count = 60) {
  const namespaces = ['votes', 'payments', 'users', 'events', 'sessions'];

  return Array.from({ length: count }, (_, i) => ({
    key: `${namespaces[i % namespaces.length]}:item:${1000 + i}`,
    namespace: namespaces[i % namespaces.length],
    type: randomItem(KEY_TYPES),
    ttl: i % 7 === 0 ? -1 : randomInt(15, 36000),
    size: randomInt(200, 60000),
    lastAccessed: new Date(Date.now() - i * 4 * 60 * 1000),
  }));
}

export function generateRateLimitCounters(count = 24) {
  return Array.from({ length: count }, (_, i) => {
    const limit = i % 2 === 0 ? 100 : 300;
    const requestCount = randomInt(0, Math.ceil(limit * 1.2));
    const remaining = Math.max(0, limit - requestCount);
    const ratio = requestCount / limit;

    return {
      id: `rl_${i + 1}`,
      ipAddress: `192.168.${i % 8}.${10 + i}`,
      endpoint: ['/vote', '/checkout', '/login', '/api/events'][i % 4],
      requestCount,
      limit,
      remaining,
      resetTime: new Date(Date.now() + randomInt(1, 50) * 60000),
      status:
        remaining === limit
          ? 'RESET'
          : ratio >= 1
            ? 'EXCEEDED'
            : ratio >= 0.8
              ? 'APPROACHING'
              : 'ACTIVE',
    };
  });
}

export function generateCacheMetrics() {
  return {
    hitsPerMinute: randomInt(25000, 60000),
    missesPerMinute: randomInt(500, 4500),
    evictionsPerMinute: randomInt(0, 80),
    avgLatency: Number((0.8 + Math.random() * 4).toFixed(2)),
    networkThroughput: randomInt(80, 600) * 1024 * 1024,
    peakMemoryUsage: randomInt(1200, 1800) * 1024 * 1024,
    commandsProcessed: randomInt(800000, 4000000),
  };
}

function generateSeries(points: number, min: number, max: number) {
  const now = Date.now();
  return Array.from({ length: points }, (_, i) => ({
    timestamp: new Date(now - (points - 1 - i) * 60 * 1000).toISOString(),
    value: randomInt(min, max),
  }));
}

export function generateMetricsTimeseries() {
  return {
    hitMissRatio: generateSeries(60, 85, 99),
    memoryUsage: generateSeries(60, 750 * 1024 * 1024, 1450 * 1024 * 1024),
    latency: generateSeries(60, 1, 8),
  };
}

export function getMaintenanceTasks() {
  return [
    {
      action: 'WARM_CACHE',
      label: 'Warm Cache',
      description: 'Preload hot keys and common query results.',
      estimatedDuration: 25,
      dangerZone: false,
    },
    {
      action: 'PURGE_EXPIRED',
      label: 'Purge Expired Keys',
      description: 'Force cleanup of expired keys and stale metadata.',
      estimatedDuration: 20,
      dangerZone: false,
    },
    {
      action: 'FLUSH_NAMESPACE',
      label: 'Flush Namespace',
      description: 'Delete all keys under a selected namespace.',
      estimatedDuration: 40,
      dangerZone: true,
      requiresPasswordReentry: true,
    },
    {
      action: 'FLUSH_ALL',
      label: 'Flush All',
      description: 'Remove all cache keys immediately.',
      estimatedDuration: 12,
      dangerZone: true,
      requiresPasswordReentry: true,
    },
  ];
}
