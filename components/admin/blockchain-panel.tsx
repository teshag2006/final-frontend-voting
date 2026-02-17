'use client';

import { CheckCircle, Clock, Layers, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { BlockchainStatus } from '@/types/admin-overview';

interface BlockchainPanelProps {
  status: BlockchainStatus;
}

export function BlockchainPanel({ status }: BlockchainPanelProps) {
  const confirmationRate = (
    ((status.confirmedAnchors / (status.confirmedAnchors + status.pendingAnchors)) * 100) || 0
  ).toFixed(1);

  const formatTimeToAnchor = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h`;
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Blockchain Anchoring</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Distributed ledger confirmation status
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-xs font-medium text-muted-foreground">Active</span>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <Layers className="h-4 w-4 text-blue-500" />
            <span className="text-xs text-muted-foreground font-medium">Total Batches</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{status.totalBatches}</p>
        </div>

        <div className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-xs text-muted-foreground font-medium">Confirmed</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{status.confirmedAnchors}</p>
          <p className="text-xs text-muted-foreground mt-1">{confirmationRate}% confirmed</p>
        </div>

        <div className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-amber-500" />
            <span className="text-xs text-muted-foreground font-medium">Pending</span>
          </div>
          <p className="text-2xl font-bold text-amber-600">{status.pendingAnchors}</p>
          <p className="text-xs text-muted-foreground mt-1">awaiting confirmation</p>
        </div>

        <div className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-purple-500" />
            <span className="text-xs text-muted-foreground font-medium">Avg Time</span>
          </div>
          <p className="text-2xl font-bold text-purple-600">
            {formatTimeToAnchor(status.averageTimeToAnchor)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">to anchor</p>
        </div>
      </div>

      {/* Network and Last Anchor Info */}
      <div className="space-y-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Blockchain Network</p>
            <p className="text-xs text-muted-foreground mt-1">
              Distributed voting records are anchored to ensure immutability
            </p>
          </div>
          <Badge variant="outline" className="whitespace-nowrap">
            {status.networkUsed}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Last Anchor</p>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(status.lastAnchorTime).toLocaleString()}
            </p>
          </div>
          <Badge variant="secondary" className="bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400">
            Just now
          </Badge>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-foreground">Confirmation Progress</p>
          <span className="text-sm font-bold text-foreground">{confirmationRate}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-border overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-300"
            style={{ width: `${confirmationRate}%` }}
          ></div>
        </div>
      </div>
    </Card>
  );
}
