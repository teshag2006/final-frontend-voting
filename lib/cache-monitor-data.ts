import { fetchAdminData } from '@/lib/admin-data-client';

export async function generateRedisOverview() {
  const [cacheRes, healthRes] = await Promise.all([
    fetchAdminData<any>('/api/admin/system/cache'),
    fetchAdminData<any>('/api/admin/system/health'),
  ]);

  const cache = cacheRes.data ?? {};
  const health = healthRes.data ?? {};

  const memoryUsage = Number(health?.resources?.memory?.used_bytes ?? 0);
  const memoryLimit = Number(health?.resources?.memory?.total_bytes ?? 1);
  const hitRatio = Number(cache.hitRatio ?? 0);

  return {
    status: String(cache.status ?? health.status ?? 'UNKNOWN').toUpperCase(),
    memoryUsage,
    memoryLimit,
    uptime: Number(health?.uptime_seconds ?? 0),
    lastUpdated: new Date(),
    keyCount: Number(cache.key_count ?? 0),
    connectedClients: Number(cache.connected_clients ?? 0),
    hitRatio,
    missRatio: Math.max(0, 1 - hitRatio),
    evictedKeys: Number(cache.evicted_keys ?? 0),
  };
}

export async function generateCacheKeys(count = 60) {
  const query = new URLSearchParams({ page: '1', limit: String(count) });
  const response = await fetchAdminData<any[]>(
    `/api/admin/system/leaderboard-cache-control?${query.toString()}`
  );
  const rows = Array.isArray(response.data) ? response.data : [];
  return rows.map((row, index) => ({
    key: String(row.cache_key ?? `leaderboard:${row.event_id ?? 'all'}:${row.category_id ?? 'all'}`),
    namespace: 'leaderboard',
    type: 'string',
    ttl: Number(row.ttl_seconds ?? -1),
    size: Number(row.size_bytes ?? 0),
    lastAccessed: new Date(String(row.last_synced_at ?? row.updated_at ?? new Date().toISOString())),
  }));
}

export async function generateRateLimitCounters(count = 24) {
  const query = new URLSearchParams({ page: '1', limit: String(count) });
  const response = await fetchAdminData<any[]>(
    `/api/admin/system/rate-limit-logs?${query.toString()}`
  );
  const rows = Array.isArray(response.data) ? response.data : [];
  return rows.map((row, index) => {
    const limit = Number(row.limit ?? row.max_requests ?? 100);
    const requestCount = Number(row.request_count ?? row.requests ?? 0);
    const remaining = Math.max(0, limit - requestCount);
    return {
      id: String(row.id ?? `rl-${index + 1}`),
      ipAddress: String(row.ip_address ?? row.ip ?? '0.0.0.0'),
      endpoint: String(row.endpoint ?? row.route ?? '/'),
      requestCount,
      limit,
      remaining,
      resetTime: new Date(String(row.reset_at ?? row.window_end ?? new Date().toISOString())),
      status:
        remaining === limit
          ? 'RESET'
          : remaining <= 0
            ? 'EXCEEDED'
            : remaining <= Math.floor(limit * 0.2)
              ? 'APPROACHING'
              : 'ACTIVE',
    };
  });
}

export async function generateCacheMetrics() {
  const response = await fetchAdminData<any>(
    '/api/admin/system/performance-metrics?page=1&limit=100'
  );
  const rows = Array.isArray(response.data) ? response.data : [];

  const findMetric = (name: string) =>
    Number(
      rows.find((row: any) => String(row.metric_name || '').toLowerCase() === name)?.metric_value ?? 0
    );

  return {
    hitsPerMinute: findMetric('cache_hits_per_minute'),
    missesPerMinute: findMetric('cache_misses_per_minute'),
    evictionsPerMinute: findMetric('cache_evictions_per_minute'),
    avgLatency: findMetric('cache_avg_latency_ms'),
    networkThroughput: findMetric('cache_network_throughput_bytes'),
    peakMemoryUsage: findMetric('cache_peak_memory_bytes'),
    commandsProcessed: findMetric('cache_commands_processed'),
  };
}

export async function generateMetricsTimeseries() {
  const response = await fetchAdminData<any[]>(
    '/api/admin/system/monitoring-metrics?page=1&limit=120'
  );
  const rows = Array.isArray(response.data) ? response.data : [];
  const toSeries = (metricName: string) =>
    rows
      .filter((row) => String(row.metric_name || '').toLowerCase() === metricName)
      .map((row) => ({
        timestamp: String(row.collected_at ?? row.timestamp ?? new Date().toISOString()),
        value: Number(row.metric_value ?? 0),
      }));

  return {
    hitMissRatio: toSeries('cache_hit_ratio'),
    memoryUsage: toSeries('cache_memory_bytes'),
    latency: toSeries('cache_avg_latency_ms'),
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
