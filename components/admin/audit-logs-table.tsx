'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AuditRiskBadge } from './audit-risk-badge';
import { Badge } from '@/components/ui/badge';
import { type AuditLog } from '@/types/audit-logs';
import { Eye, Copy, ExternalLink } from 'lucide-react';

interface AuditLogsTableProps {
  logs: AuditLog[];
  isLoading?: boolean;
  onViewDetails: (log: AuditLog) => void;
}

export function AuditLogsTable({ logs, isLoading, onViewDetails }: AuditLogsTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, logId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(logId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Log ID</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Module</TableHead>
              <TableHead>Resource</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Risk</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-28" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-8 w-20" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="whitespace-nowrap">Log ID</TableHead>
            <TableHead className="whitespace-nowrap">Timestamp</TableHead>
            <TableHead className="whitespace-nowrap">Actor</TableHead>
            <TableHead className="whitespace-nowrap">Action</TableHead>
            <TableHead className="whitespace-nowrap">Module</TableHead>
            <TableHead className="whitespace-nowrap">Resource</TableHead>
            <TableHead className="whitespace-nowrap">IP Address</TableHead>
            <TableHead className="whitespace-nowrap">Status</TableHead>
            <TableHead className="whitespace-nowrap">Risk</TableHead>
            <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id} className="hover:bg-muted/50 transition-colors">
              <TableCell className="font-mono text-xs whitespace-nowrap">{log.logId}</TableCell>
              <TableCell className="whitespace-nowrap text-sm">
                {new Date(log.timestamp).toLocaleString()}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">{log.actorName}</span>
                  <span className="text-xs text-muted-foreground">{log.actorRole}</span>
                </div>
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <Badge variant="outline" className="text-xs">
                  {log.actionType}
                </Badge>
              </TableCell>
              <TableCell className="whitespace-nowrap text-sm">{log.module}</TableCell>
              <TableCell className="whitespace-nowrap">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">{log.resourceType}</span>
                  <span className="text-xs text-muted-foreground font-mono">{log.resourceId}</span>
                </div>
              </TableCell>
              <TableCell className="whitespace-nowrap text-xs font-mono">{log.ipAddress}</TableCell>
              <TableCell className="whitespace-nowrap">
                <Badge variant={log.status === 'SUCCESS' ? 'default' : 'destructive'} className="text-xs">
                  {log.status}
                </Badge>
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <AuditRiskBadge level={log.riskLevel} />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetails(log)}
                    className="h-8 w-8 p-0"
                    title="View details"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(log.id, log.id)}
                    className="h-8 w-8 p-0"
                    title={copiedId === log.id ? 'Copied!' : 'Copy ID'}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
