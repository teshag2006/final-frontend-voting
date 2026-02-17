'use client';

import type { BlockchainStatus, AnchoredBatch } from '@/types/media';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Network, Hash, Download, ExternalLink, AlertCircle } from 'lucide-react';

interface BlockchainPanelProps {
  status: BlockchainStatus;
  recentBatches: AnchoredBatch[];
}

export function BlockchainPanel({ status, recentBatches }: BlockchainPanelProps) {
  const getStatusColor = (networkStatus: string) => {
    if (networkStatus === 'Connected') return 'text-green-400 bg-green-500/10';
    if (networkStatus === 'Syncing') return 'text-amber-400 bg-amber-500/10';
    return 'text-red-400 bg-red-500/10';
  };

  return (
    <Card className="border-0 bg-slate-950 p-6 shadow-lg">
      <h3 className="mb-6 text-lg font-semibold text-white">Blockchain Transparency Panel</h3>

      {/* Status Overview */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-slate-900 p-4">
          <p className="text-xs font-medium text-slate-400">Network Status</p>
          <div className={`mt-2 inline-flex items-center gap-2 rounded-lg px-2 py-1 ${getStatusColor(status.networkStatus)}`}>
            <Network className="h-4 w-4" />
            <span className="text-sm font-semibold">{status.networkStatus}</span>
          </div>
        </div>

        <div className="rounded-lg bg-slate-900 p-4">
          <p className="text-xs font-medium text-slate-400">Block Height</p>
          <p className="mt-2 text-lg font-bold text-white">{status.currentBlockHeight.toLocaleString()}</p>
        </div>

        <div className="rounded-lg bg-slate-900 p-4">
          <p className="text-xs font-medium text-slate-400">Anchored Batches</p>
          <p className="mt-2 text-lg font-bold text-white">{status.totalAnchoredBatches}</p>
        </div>

        <div className="rounded-lg bg-slate-900 p-4">
          <p className="text-xs font-medium text-slate-400">Network</p>
          <p className="mt-2 truncate text-sm font-semibold text-blue-400">{status.networkName}</p>
        </div>
      </div>

      {/* Contract Details */}
      <div className="mb-6 space-y-2 rounded-lg border border-slate-700 bg-slate-900/50 p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-slate-400">Smart Contract Address</p>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
        <code className="block break-all rounded bg-slate-950 p-2 text-xs text-slate-300">
          {status.contractAddress}
        </code>
      </div>

      {/* Recent Anchored Batches */}
      <div className="mb-6">
        <h4 className="mb-4 text-sm font-semibold text-white">Recent Anchored Batches</h4>
        <div className="space-y-3">
          {recentBatches.slice(0, 3).map((batch) => (
            <div key={batch.batchId} className="flex items-start justify-between rounded-lg border border-slate-700 bg-slate-900/50 p-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span className="font-mono text-sm font-semibold text-slate-300">{batch.batchId}</span>
                </div>
                <div className="mt-1 grid grid-cols-3 gap-4 text-xs text-slate-400">
                  <div>
                    Block: <span className="text-slate-200">{batch.blockNumber.toLocaleString()}</span>
                  </div>
                  <div>
                    Votes: <span className="text-slate-200">{batch.voteCount.toLocaleString()}</span>
                  </div>
                  <div>
                    Status: <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400">
                      {batch.status}
                    </Badge>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Verification Info */}
      <div className="flex items-start gap-3 rounded-lg border border-blue-700/50 bg-blue-500/10 p-4">
        <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-300">
          <p className="font-medium">Transparent & Verifiable</p>
          <p className="mt-1 text-xs text-blue-200">
            All vote batches are anchored to the blockchain for complete transparency and public verification.
          </p>
        </div>
      </div>
    </Card>
  );
}
