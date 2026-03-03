import { fetchAdminData } from '@/lib/admin-data-client';

export async function generateSystemHealthOverview() {
  const response = await fetchAdminData<any>('/api/admin/system/health');
  const health = response.data ?? {};
  const services = Array.isArray(health.services) ? health.services : [];

  return {
    status: String(health.status ?? 'UNKNOWN').toUpperCase(),
    apiUptime: Number(health.uptime_percent ?? 0),
    environment: String(health.environment ?? 'PROD'),
    version: String(health.version ?? '1.0.0'),
    lastDeployment: String(health.last_deployment_at ?? new Date().toISOString()),
    servicesHealthy: services.filter((svc: any) => String(svc.status).toLowerCase() === 'up').length,
    servicesDegraded: services.filter((svc: any) => String(svc.status).toLowerCase() === 'degraded').length,
    servicesDown: services.filter((svc: any) => String(svc.status).toLowerCase() === 'down').length,
  };
}

export async function generateCoreServices() {
  const response = await fetchAdminData<any>('/api/admin/system/health');
  const services = Array.isArray(response.data?.services) ? response.data.services : [];
  return services.map((svc: any, index: number) => ({
    id: String(svc.id ?? `svc-${index + 1}`),
    name: String(svc.name ?? `Service ${index + 1}`),
    status: String(svc.status ?? 'UP').toUpperCase(),
    responseTime: Number(svc.response_time_ms ?? 0),
    uptime: Number(svc.uptime_percent ?? 0),
    errorCount: Number(svc.error_count ?? 0),
    lastChecked: String(svc.last_checked_at ?? new Date().toISOString()),
  }));
}

export async function generateExternalIntegrations() {
  const response = await fetchAdminData<any[]>('/api/admin/system/integrations?page=1&limit=30');
  const rows = Array.isArray(response.data) ? response.data : [];
  return rows.map((row: any, index: number) => ({
    id: String(row.id ?? `int-${index + 1}`),
    name: String(row.name ?? `Integration ${index + 1}`),
    status: String(row.status ?? 'UP').toUpperCase(),
    latency: Number(row.latency_ms ?? 0),
    lastSuccess: String(row.last_success_at ?? new Date().toISOString()),
    failureCount24h: Number(row.failure_count_24h ?? 0),
    failureRate: Number(row.failure_rate_percent ?? 0),
  }));
}

export async function generateResourceMetrics() {
  const response = await fetchAdminData<any>('/api/admin/system/health');
  const resources = response.data?.resources ?? {};
  return {
    cpu: {
      current: Number(resources.cpu?.current_percent ?? 0),
      avg: Number(resources.cpu?.avg_percent ?? 0),
      peak: Number(resources.cpu?.peak_percent ?? 0),
    },
    memory: {
      current: Number(resources.memory?.current_percent ?? 0),
      avg: Number(resources.memory?.avg_percent ?? 0),
      peak: Number(resources.memory?.peak_percent ?? 0),
    },
    disk: {
      current: Number(resources.disk?.current_percent ?? 0),
      avg: Number(resources.disk?.avg_percent ?? 0),
      peak: Number(resources.disk?.peak_percent ?? 0),
    },
    connections: {
      active: Number(resources.connections?.active ?? 0),
      total: Number(resources.connections?.total ?? 0),
      percentage: Number(resources.connections?.percentage ?? 0),
    },
    dbPoolUsage: {
      active: Number(resources.db_pool?.active ?? 0),
      total: Number(resources.db_pool?.total ?? 0),
      percentage: Number(resources.db_pool?.percentage ?? 0),
    },
    redisMemory: {
      used: Number(resources.redis?.used_mb ?? 0),
      total: Number(resources.redis?.total_mb ?? 0),
      percentage: Number(resources.redis?.percentage ?? 0),
    },
    cpuHistory: Array.isArray(resources.cpu?.history) ? resources.cpu.history : [],
    memoryHistory: Array.isArray(resources.memory?.history) ? resources.memory.history : [],
    connectionHistory: Array.isArray(resources.connections?.history) ? resources.connections.history : [],
  };
}

export async function generateWebhookStatus() {
  const response = await fetchAdminData<any[]>('/api/admin/system/webhooks?page=1&limit=50');
  const rows = Array.isArray(response.data) ? response.data : [];
  return rows.map((row: any, index: number) => ({
    id: String(row.id ?? `wh-${index + 1}`),
    name: String(row.name ?? `Webhook ${index + 1}`),
    source: String(row.source ?? 'System'),
    status: String(row.status ?? 'SUCCESS').toUpperCase(),
    responseCode: Number(row.response_code ?? 200),
    latency: Number(row.latency_ms ?? 0),
    retryCount: Number(row.retry_count ?? 0),
    timestamp: String(row.timestamp ?? new Date().toISOString()),
  }));
}
