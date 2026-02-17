'use client';

import { Card } from '@/components/ui/card';
import { HealthStatusBadge } from './health-status-badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Clock, Zap } from 'lucide-react';
import type { ServiceHealth } from '@/types/health-monitor';

interface HealthCoreServicesProps {
  services: ServiceHealth[];
}

export function HealthCoreServices({ services }: HealthCoreServicesProps) {
  const formatTime = (isoString: string) => {
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
          <h3 className="text-lg font-semibold text-foreground">Core Services</h3>
          <p className="text-sm text-muted-foreground mt-1">Health status of critical system services</p>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50">
                <TableHead className="font-semibold">Service</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold text-right">Response Time</TableHead>
                <TableHead className="font-semibold text-right">Uptime</TableHead>
                <TableHead className="font-semibold text-right">Errors</TableHead>
                <TableHead className="font-semibold text-right">Last Checked</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id} className="border-border/50 hover:bg-background/50 transition-colors">
                  <TableCell className="font-medium text-foreground">{service.name}</TableCell>
                  <TableCell>
                    <HealthStatusBadge status={service.status} size="sm" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Zap className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm font-mono text-foreground">{service.responseTime}ms</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="inline-flex items-center gap-2">
                      <div className="h-1.5 w-12 rounded-full bg-green-100">
                        <div
                          className="h-full rounded-full bg-green-600"
                          style={{ width: `${service.uptime}%` }}
                        />
                      </div>
                      <span className="text-sm font-mono text-foreground">{service.uptime}%</span>
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={`text-sm font-mono font-semibold ${
                        service.errorCount === 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {service.errorCount}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5 text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{formatTime(service.lastChecked)}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </Card>
  );
}
