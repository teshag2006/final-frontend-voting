'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { BlockchainStatusBadge } from './blockchain-status-badge';
import { AnchorRecord } from '@/types/blockchain-monitor';
import { Eye, RotateCcw, CheckCircle2, ExternalLink } from 'lucide-react';

interface BlockchainAnchorsTableProps {
  records: AnchorRecord[];
  isLoading?: boolean;
  onViewSnapshot?: (record: AnchorRecord) => void;
  onRetry?: (recordId: string) => void;
  onVerifyHash?: (record: AnchorRecord) => void;
}

export function BlockchainAnchorsTable({
  records,
  isLoading,
  onViewSnapshot,
  onRetry,
  onVerifyHash,
}: BlockchainAnchorsTableProps) {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const toggleRow = (anchorId: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(anchorId)) {
      newSelected.delete(anchorId);
    } else {
      newSelected.add(anchorId);
    }
    setSelectedRows(newSelected);
  };

  const shortenHash = (hash: string, length = 8) => hash.slice(0, length) + '...';

  const getExplorerUrl = (txHash: string, network: string) => {
    const explorers: Record<string, string> = {
      ETHEREUM: `https://etherscan.io/tx/${txHash}`,
      POLYGON: `https://polygonscan.com/tx/${txHash}`,
      ARBITRUM: `https://arbiscan.io/tx/${txHash}`,
      OPTIMISM: `https://optimistic.etherscan.io/tx/${txHash}`,
    };
    return explorers[network] || '#';
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 bg-gradient-to-r from-slate-100 to-slate-50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead className="w-12">
              <input type="checkbox" className="rounded border-gray-300" />
            </TableHead>
            <TableHead className="font-semibold">Anchor ID</TableHead>
            <TableHead className="font-semibold">Type</TableHead>
            <TableHead className="font-semibold">Reference</TableHead>
            <TableHead className="font-semibold">Hash</TableHead>
            <TableHead className="font-semibold">Network</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Anchored At</TableHead>
            <TableHead className="font-semibold text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow key={record.anchorId} className="hover:bg-slate-50">
              <TableCell>
                <input
                  type="checkbox"
                  className="rounded border-gray-300"
                  checked={selectedRows.has(record.anchorId)}
                  onChange={() => toggleRow(record.anchorId)}
                />
              </TableCell>
              <TableCell className="font-mono text-sm">{record.anchorId.slice(-8)}</TableCell>
              <TableCell className="text-sm">{record.anchorType}</TableCell>
              <TableCell className="text-sm">{record.referenceId}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                    {shortenHash(record.snapshotHash)}
                  </code>
                  <button
                    onClick={() => navigator.clipboard.writeText(record.snapshotHash)}
                    className="text-slate-500 hover:text-slate-700"
                    title="Copy hash"
                  >
                    📋
                  </button>
                </div>
              </TableCell>
              <TableCell className="text-sm">{record.blockchainNetwork}</TableCell>
              <TableCell>
                <BlockchainStatusBadge status={record.status} />
              </TableCell>
              <TableCell className="text-sm">
                {new Date(record.anchoredAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewSnapshot?.(record)}
                    title="View snapshot"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <a
                    href={getExplorerUrl(record.transactionHash, record.blockchainNetwork)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-slate-100"
                    title="View in explorer"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  {record.status === 'FAILED' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRetry?.(record.anchorId)}
                      title="Retry anchor"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  )}
                  {record.status === 'CONFIRMED' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onVerifyHash?.(record)}
                      title="Verify hash"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
