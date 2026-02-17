'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CacheMetrics, CacheMetricsTimeseries } from '@/types/cache-monitor';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Zap, TrendingDown, Network, Gauge } from 'lucide-react';

interface CacheMetricsTabProps {
  metrics: CacheMetrics;
  timeseries: CacheMetricsTimeseries;
  isLoading?: boolean;
}

export function CacheMetricsTab({
  metrics,
  timeseries,
  isLoading = false,
}: CacheMetricsTabProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="h-80 rounded-lg bg-muted animate-pulse" />
          <div className="h-80 rounded-lg bg-muted animate-pulse" />
        </div>
      </div>
    );
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const kpiCards = [
    {
      icon: Zap,
      label: 'Hits/Min',
      value: metrics.hitsPerMinute.toLocaleString(),
      color: 'text-green-600',
    },
    {
      icon: Activity,
      label: 'Misses/Min',
      value: metrics.missesPerMinute.toLocaleString(),
      color: 'text-orange-600',
    },
    {
      icon: TrendingDown,
      label: 'Evictions/Min',
      value: metrics.evictionsPerMinute.toLocaleString(),
      color: 'text-red-600',
    },
    {
      icon: Gauge,
      label: 'Avg Latency',
      value: `${metrics.avgLatency.toFixed(2)}ms`,
      color: 'text-blue-600',
    },
    {
      icon: Network,
      label: 'Throughput',
      value: formatBytes(metrics.networkThroughput),
      color: 'text-purple-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label}>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">{kpi.label}</p>
                    <Icon className={`h-4 w-4 ${kpi.color}`} />
                  </div>
                  <p className="text-xl font-bold">{kpi.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Hit/Miss Ratio Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Hit/Miss Ratio (Last Hour)</CardTitle>
            <CardDescription>Cache performance trend</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={timeseries.hitMissRatio}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }}
                  formatter={(value) => `${(value as number).toFixed(1)}%`}
                  labelFormatter={(label) => new Date(label).toLocaleTimeString()}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#10b981"
                  dot={false}
                  strokeWidth={2}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Memory Usage Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Memory Usage (Last Hour)</CardTitle>
            <CardDescription>Peak: {formatBytes(metrics.peakMemoryUsage)}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={timeseries.memoryUsage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }}
                  formatter={(value) => formatBytes(value as number)}
                  labelFormatter={(label) => new Date(label).toLocaleTimeString()}
                />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Latency Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Latency Trend (Last Hour)</CardTitle>
            <CardDescription>Response time in milliseconds</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={timeseries.latency}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }}
                  formatter={(value) => `${(value as number).toFixed(2)}ms`}
                  labelFormatter={(label) => new Date(label).toLocaleTimeString()}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#f59e0b"
                  dot={false}
                  strokeWidth={2}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Stats Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Commands Processed</p>
              <p className="text-2xl font-bold">{metrics.commandsProcessed.toLocaleString()}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Network Throughput</p>
              <p className="text-2xl font-bold">{formatBytes(metrics.networkThroughput)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
