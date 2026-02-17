'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { AuditRiskBadge } from './audit-risk-badge';
import { type AuditLog } from '@/types/audit-logs';
import { Copy, Download } from 'lucide-react';
import { useState } from 'react';

interface AuditLogDetailModalProps {
  log: AuditLog | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AuditLogDetailModal({ log, isOpen, onClose }: AuditLogDetailModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (!log) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Audit Log Details</DialogTitle>
          <DialogDescription>Complete record of administrative action (read-only)</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Log ID</p>
              <div className="flex items-center gap-2 mt-1">
                <code className="text-sm font-mono bg-muted px-2 py-1 rounded flex-1">{log.logId}</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(log.logId, 'logId')}
                  className="h-8 w-8 p-0"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Timestamp</p>
              <p className="text-sm font-medium mt-1">{new Date(log.timestamp).toLocaleString()}</p>
            </div>
          </div>

          <Separator />

          {/* Action Info */}
          <div>
            <h3 className="font-semibold mb-3">Action Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Actor</p>
                <p className="text-sm font-medium mt-1">{log.actorName}</p>
                <p className="text-xs text-muted-foreground">{log.actorRole}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Action Type</p>
                <Badge variant="outline" className="mt-1">
                  {log.actionType}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Module</p>
                <p className="text-sm font-medium mt-1">{log.module}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <Badge variant={log.status === 'SUCCESS' ? 'default' : 'destructive'} className="mt-1">
                  {log.status}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Resource Info */}
          <div>
            <h3 className="font-semibold mb-3">Resource Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Resource Type</p>
                <p className="text-sm font-medium mt-1">{log.resourceType}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Resource ID</p>
                <code className="text-xs font-mono bg-muted px-2 py-1 rounded mt-1 inline-block">
                  {log.resourceId}
                </code>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground">Description</p>
                <p className="text-sm mt-1">{log.description}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Security Info */}
          <div>
            <h3 className="font-semibold mb-3">Security Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Risk Level</p>
                <div className="mt-1">
                  <AuditRiskBadge level={log.riskLevel} />
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">IP Address</p>
                <code className="text-xs font-mono bg-muted px-2 py-1 rounded mt-1 inline-block">
                  {log.ipAddress}
                </code>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground">User Agent</p>
                <code className="text-xs font-mono bg-muted px-2 py-1 rounded mt-1 block overflow-x-auto">
                  {log.userAgent}
                </code>
              </div>
            </div>
          </div>

          <Separator />

          {/* Correlation IDs */}
          <div>
            <h3 className="font-semibold mb-3">Correlation IDs</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Correlation ID</p>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-xs font-mono bg-muted px-2 py-1 rounded flex-1">{log.correlationId}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(log.correlationId, 'correlationId')}
                    className="h-8 w-8 p-0"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Request ID</p>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-xs font-mono bg-muted px-2 py-1 rounded flex-1">{log.requestId}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(log.requestId, 'requestId')}
                    className="h-8 w-8 p-0"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Before/After State */}
          {(log.beforeState || log.afterState) && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-3">State Changes</h3>
                <div className="grid grid-cols-2 gap-4">
                  {log.beforeState && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Before State</p>
                      <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                        {JSON.stringify(log.beforeState, null, 2)}
                      </pre>
                    </div>
                  )}
                  {log.afterState && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">After State</p>
                      <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                        {JSON.stringify(log.afterState, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {log.fraudScore !== undefined && (
            <>
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground">Fraud Score</p>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant={log.fraudScore > 70 ? 'destructive' : 'outline'}>{log.fraudScore}</Badge>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            Export Details
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
