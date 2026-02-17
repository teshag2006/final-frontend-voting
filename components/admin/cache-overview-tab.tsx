'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RedisOverview } from '@/types/cache-monitor';
import { CacheStatusBadge } from './cache-status-badge';
import {
  Activity,
  Database,
  HardDrive,
  Zap,
  Clock,
  Users,
  TrendingUp,
  Trash2,
} from 'lucide-react';

interface CacheOverviewTabProps {
  data: RedisOverview;
  isLoading?: boolean;
}

export function CacheOverviewTab({ data, isLoading = false }: CacheOverviewTabProps) {
  const memoryPercentage = (data.memoryUsage / data.memoryLimit) * 100;
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${mins}m`;
  };

  const statsCards = [
    {
      icon: Database,
      label: 'Total Keys',
      value: data.keyCount.toLocaleString(),
      color: 'text-blue-600',
    },
    {
      icon: Users,
      label: 'Connected Clients',
      value: data.connectedClients.toString(),
      color: 'text-purple-600',
    },
    {
      icon: TrendingUp,
      label: 'Hit Ratio',
      value: `${(data.hitRatio * 100).toFixed(1)}%`,
      color: 'text-green-600',
    },
    {
      icon: Trash2,
      label: 'Evicted Keys',
      value: data.evictedKeys.toLocaleString(),
      color: 'text-orange-600',
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-40 rounded-lg bg-muted animate-pulse" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status & Memory Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Redis Status</CardTitle>
              <CardDescription>Real-time connection and memory metrics</CardDescription>
            </div>
            <CacheStatusBadge status={data.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Memory Usage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Memory Usage</span>
              </div>
              <span className="text-sm font-semibold">
                {formatBytes(data.memoryUsage)} / {formatBytes(data.memoryLimit)}
              </span>
            </div>
            <Progress value={memoryPercentage} className="h-2" />
            <p className="text-xs text-muted-foreground">{memoryPercentage.toFixed(1)}% used</p>
          </div>

          {/* Uptime */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Uptime</span>
            </div>
            <span className="text-sm font-semibold">{formatUptime(data.uptime)}</span>
          </div>

          {/* Last Updated */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Last updated</span>
            <span>{data.lastUpdated.toLocaleTimeString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Hit/Miss Ratio Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Cache Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Hit Ratio</span>
                <span className="text-sm font-semibold text-green-600">
                  {(data.hitRatio * 100).toFixed(1)}%
                </span>
              </div>
              <Progress value={data.hitRatio * 100} className="h-2 bg-red-100" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Miss Ratio</span>
                <span className="text-sm font-semibold text-orange-600">
                  {(data.missRatio * 100).toFixed(1)}%
                </span>
              </div>
              <Progress value={data.missRatio * 100} className="h-2 bg-yellow-100" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
