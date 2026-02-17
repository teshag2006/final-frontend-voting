'use client';

import { Card } from '@/components/ui/card';
import { HealthStatusBadge } from './health-status-badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, TrendingUp } from 'lucide-react';
import type { IntegrationHealth } from '@/types/health-monitor';

interface HealthIntegrationsProps {
  integrations: IntegrationHealth[];
}

export function HealthIntegrations({ integrations }: HealthIntegrationsProps) {
  const formatTime = (isoString: string | null) => {
    if (!isoString) return 'Never';
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);

    if (diffSecs < 60) return `${diffSecs}s ago`;
    if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
    return `${Math.floor(diffSecs / 3600)}h ago`;
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">External Integrations</h3>
          <p className="text-sm text-muted-foreground mt-1">Third-party services and APIs connectivity</p>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50">
                <TableHead className="font-semibold">Integration</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold text-right">Latency</TableHead>
                <TableHead className="font-semibold text-right">Last Success</TableHead>
                <TableHead className="font-semibold text-right">Failures (24h)</TableHead>
                <TableHead className="font-semibold text-right">Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {integrations.map((integration) => (
                <TableRow key={integration.id} className="border-border/50 hover:bg-background/50 transition-colors">
                  <TableCell className="font-medium text-foreground">{integration.name}</TableCell>
                  <TableCell>
                    <HealthStatusBadge status={integration.status} size="sm" />
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-sm font-mono text-foreground">{integration.latency}ms</span>
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {formatTime(integration.lastSuccess)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={`text-sm font-mono font-semibold ${
                        integration.failureCount24h === 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {integration.failureCount24h}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {integration.failureRate > 0 && (
                        <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                      )}
                      <span
                        className={`text-sm font-mono ${
                          integration.failureRate > 0 ? 'text-amber-600' : 'text-green-600'
                        }`}
                      >
                        {integration.failureRate.toFixed(1)}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="pt-3 border-t border-border/30 flex items-start gap-2 text-sm text-muted-foreground bg-background/50 p-3 rounded-lg">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-amber-600" />
          <p>Last failure rate reported 24 hours ago. Monitor integrations with high failure rates closely.</p>
        </div>
      </div>
    </Card>
  );
}
