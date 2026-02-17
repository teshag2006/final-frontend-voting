'use client';

import { Card } from '@/components/ui/card';
import { HealthStatusBadge } from './health-status-badge';
import { Gauge, Clock, GitBranch } from 'lucide-react';
import type { SystemHealth } from '@/types/health-monitor';

interface HealthOverallStatusProps {
  data: SystemHealth;
}

export function HealthOverallStatus({ data }: HealthOverallStatusProps) {
  const deploymentDate = new Date(data.lastDeployment);
  const deploymentTime = deploymentDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Card className="p-8 bg-gradient-to-br from-card to-card/50 border border-border">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">System Status</h2>
            <p className="text-sm text-muted-foreground mt-1">Real-time health overview</p>
          </div>
          <HealthStatusBadge status={data.status} size="md" />
        </div>

        {/* Grid of status items */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* API Uptime */}
          <div className="rounded-lg bg-background/50 p-4 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Gauge className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">API Uptime</p>
            </div>
            <p className="text-2xl font-bold text-foreground">{data.apiUptime}%</p>
          </div>

          {/* Environment */}
          <div className="rounded-lg bg-background/50 p-4 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <GitBranch className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Environment</p>
            </div>
            <p className="text-2xl font-bold text-foreground">{data.environment}</p>
          </div>

          {/* Version */}
          <div className="rounded-lg bg-background/50 p-4 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Version</span>
            </div>
            <p className="text-2xl font-bold text-foreground">v{data.version}</p>
          </div>

          {/* Last Deployment */}
          <div className="rounded-lg bg-background/50 p-4 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Last Deploy</p>
            </div>
            <p className="text-sm font-bold text-foreground">{deploymentTime}</p>
          </div>
        </div>

        {/* Services Status Summary */}
        <div className="pt-4 border-t border-border/30">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-green-100/20 flex items-center justify-center border border-green-200/50">
                <span className="text-lg font-bold text-green-600">{data.servicesHealthy}</span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Services Healthy</p>
                <p className="text-sm font-semibold text-foreground">All operational</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-amber-100/20 flex items-center justify-center border border-amber-200/50">
                <span className="text-lg font-bold text-amber-600">{data.servicesDegraded}</span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Degraded</p>
                <p className="text-sm font-semibold text-foreground">Non-critical issues</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-red-100/20 flex items-center justify-center border border-red-200/50">
                <span className="text-lg font-bold text-red-600">{data.servicesDown}</span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Down</p>
                <p className="text-sm font-semibold text-foreground">Requires attention</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
