'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, HelpCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { CacheOverviewTab } from '@/components/admin/cache-overview-tab';
import { CacheKeysExplorerTab } from '@/components/admin/cache-keys-explorer-tab';
import { CacheMetricsTab } from '@/components/admin/cache-metrics-tab';
import { CacheRateLimitsTab } from '@/components/admin/cache-rate-limits-tab';
import { CacheMaintenanceTab } from '@/components/admin/cache-maintenance-tab';

import {
  generateRedisOverview,
  generateCacheKeys,
  generateRateLimitCounters,
  generateCacheMetrics,
  generateMetricsTimeseries,
  getMaintenanceTasks,
} from '@/lib/cache-monitor-mock';

export default function RedisCacheMonitorPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isSuperAdmin] = useState(true); // TODO: Get from auth context

  // Mock data states
  const [overview, setOverview] = useState(generateRedisOverview());
  const [keys, setKeys] = useState(generateCacheKeys());
  const [rateLimits, setRateLimits] = useState(generateRateLimitCounters());
  const [metrics, setMetrics] = useState(generateCacheMetrics());
  const [timeseries, setTimeseries] = useState(generateMetricsTimeseries());
  const [maintenanceTasks] = useState(getMaintenanceTasks());

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API calls
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setOverview(generateRedisOverview());
      setKeys(generateCacheKeys());
      setRateLimits(generateRateLimitCounters());
      setMetrics(generateCacheMetrics());
      setTimeseries(generateMetricsTimeseries());
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to refresh cache data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteKey = async (key: string) => {
    // TODO: Replace with actual API call
    // DELETE /admin/cache/key/:key
    setKeys((prev) => prev.filter((k) => k.key !== key));
  };

  const handleResetCounter = async (id: string) => {
    // TODO: Replace with actual API call
    // POST /admin/cache/reset-rate-limit
    setRateLimits((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, requestCount: 0, remaining: c.limit, status: 'RESET' as const }
          : c
      )
    );
  };

  const handleBlockIP = async (ip: string) => {
    // TODO: Replace with actual API call
    // POST /admin/cache/block-ip
    console.log('Blocking IP:', ip);
  };

  const handleExecuteTask = async (action: string) => {
    // TODO: Replace with actual API call
    // POST /admin/cache/maintenance/:action
    console.log('Executing task:', action);
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      handleRefresh();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Redis Cache Monitor</h1>
          <p className="text-muted-foreground mt-1">
            Manage cache performance, keys, and maintenance tasks
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Last Refresh Info */}
      <div className="text-xs text-muted-foreground">
        Last updated: {lastRefresh.toLocaleTimeString()}
      </div>

      {/* Help Alert */}
      <Alert>
        <HelpCircle className="h-4 w-4" />
        <AlertDescription>
          This dashboard provides visibility into Redis cache performance and health. Use the tabs to explore keys, view metrics, and execute maintenance tasks. All destructive actions are logged for audit purposes.
        </AlertDescription>
      </Alert>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="keys">Keys</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="rate-limits">Rate Limits</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <CacheOverviewTab data={overview} isLoading={isLoading} />
        </TabsContent>

        {/* Keys Explorer Tab */}
        <TabsContent value="keys" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Keys Explorer</CardTitle>
              <CardDescription>
                Browse and manage Redis keys. Pagination limited to 10 items per page for performance.
              </CardDescription>
            </CardHeader>
          </Card>
          <CacheKeysExplorerTab
            keys={keys}
            isLoading={isLoading}
            onDeleteKey={handleDeleteKey}
            isSuperAdmin={isSuperAdmin}
          />
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cache Metrics</CardTitle>
              <CardDescription>
                Real-time performance metrics and historical trends over the last hour.
              </CardDescription>
            </CardHeader>
          </Card>
          <CacheMetricsTab
            metrics={metrics}
            timeseries={timeseries}
            isLoading={isLoading}
          />
        </TabsContent>

        {/* Rate Limits Tab */}
        <TabsContent value="rate-limits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rate Limits</CardTitle>
              <CardDescription>
                Monitor active rate limiting counters and manage IP-based restrictions.
              </CardDescription>
            </CardHeader>
          </Card>
          <CacheRateLimitsTab
            counters={rateLimits}
            isLoading={isLoading}
            onResetCounter={handleResetCounter}
            onBlockIP={handleBlockIP}
          />
        </TabsContent>

        {/* Maintenance Tab */}
        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Tools</CardTitle>
              <CardDescription>
                Execute cache maintenance tasks. Danger zone tasks require SUPER_ADMIN role.
              </CardDescription>
            </CardHeader>
          </Card>
          <CacheMaintenanceTab
            tasks={maintenanceTasks}
            isLoading={isLoading}
            onExecuteTask={handleExecuteTask}
            isSuperAdmin={isSuperAdmin}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
