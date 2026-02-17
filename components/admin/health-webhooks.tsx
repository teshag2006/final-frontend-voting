'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Check, AlertCircle, RotateCcw, Clock } from 'lucide-react';
import type { WebhookStatus, WebhookStatusType } from '@/types/health-monitor';

interface HealthWebhooksProps {
  webhooks: WebhookStatus[];
}

export function HealthWebhooks({ webhooks }: HealthWebhooksProps) {
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);

    if (diffSecs < 60) return `${diffSecs}s ago`;
    if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
    return `${Math.floor(diffSecs / 3600)}h ago`;
  };

  const getStatusBadge = (status: WebhookStatusType) => {
    switch (status) {
      case 'SUCCESS':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200 flex items-center gap-1.5 w-fit">
            <Check className="h-3.5 w-3.5" />
            Success
          </Badge>
        );
      case 'FAILED':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200 flex items-center gap-1.5 w-fit">
            <AlertCircle className="h-3.5 w-3.5" />
            Failed
          </Badge>
        );
      case 'RETRY':
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 flex items-center gap-1.5 w-fit">
            <RotateCcw className="h-3.5 w-3.5" />
            Retrying
          </Badge>
        );
      case 'PENDING':
        return (
          <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-200 flex items-center gap-1.5 w-fit">
            <Clock className="h-3.5 w-3.5" />
            Pending
          </Badge>
        );
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Webhooks & Callbacks</h3>
          <p className="text-sm text-muted-foreground mt-1">Recent webhook delivery and external callback events</p>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50">
                <TableHead className="font-semibold">Webhook</TableHead>
                <TableHead className="font-semibold">Source</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold text-right">Code</TableHead>
                <TableHead className="font-semibold text-right">Latency</TableHead>
                <TableHead className="font-semibold text-right">Retries</TableHead>
                <TableHead className="font-semibold text-right">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {webhooks.map((webhook) => (
                <TableRow key={webhook.id} className="border-border/50 hover:bg-background/50 transition-colors">
                  <TableCell className="font-medium text-foreground">{webhook.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{webhook.source}</TableCell>
                  <TableCell>{getStatusBadge(webhook.status)}</TableCell>
                  <TableCell className="text-right">
                    <span
                      className={`text-sm font-mono font-semibold ${
                        webhook.responseCode >= 200 && webhook.responseCode < 300
                          ? 'text-green-600'
                          : webhook.responseCode >= 400
                            ? 'text-red-600'
                            : 'text-amber-600'
                      }`}
                    >
                      {webhook.responseCode}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">{webhook.latency}ms</TableCell>
                  <TableCell className="text-right">
                    <span
                      className={`text-sm font-mono font-semibold ${webhook.retryCount > 0 ? 'text-amber-600' : 'text-green-600'}`}
                    >
                      {webhook.retryCount}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">{formatTime(webhook.timestamp)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {webhooks.some((w) => w.retryCount > 0) && (
          <div className="pt-3 border-t border-border/30 flex items-start gap-2 text-sm text-muted-foreground bg-background/50 p-3 rounded-lg">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-amber-600" />
            <p>Some webhooks have retry attempts. Monitor these webhooks for persistent failures.</p>
          </div>
        )}
      </div>
    </Card>
  );
}
