'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { VoteFraudBadge } from './vote-fraud-badge';
import { Vote, PaymentStatus } from '@/types/vote-monitoring';
import { Eye, Lock, AlertTriangle } from 'lucide-react';

interface VoteLiveTableProps {
  votes: Vote[];
  isLoading?: boolean;
  onViewDetails?: (vote: Vote) => void;
  onBlockIp?: (ipAddress: string) => void;
  onFlagVote?: (voteId: string) => void;
}

export function VoteLiveTable({
  votes,
  isLoading,
  onViewDetails,
  onBlockIp,
  onFlagVote,
}: VoteLiveTableProps) {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const toggleRow = (voteId: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(voteId)) {
      newSelected.delete(voteId);
    } else {
      newSelected.add(voteId);
    }
    setSelectedRows(newSelected);
  };

  const getPaymentStatusColor = (status: PaymentStatus) => {
    const colors = {
      PAID: 'bg-green-100 text-green-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      FAILED: 'bg-red-100 text-red-800',
    };
    return colors[status];
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    if (diff < 60000) return 'Now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 bg-gradient-to-r from-slate-100 to-slate-50 rounded animate-pulse" />
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
            <TableHead className="font-semibold">Vote ID</TableHead>
            <TableHead className="font-semibold">Time</TableHead>
            <TableHead className="font-semibold">Contestant</TableHead>
            <TableHead className="font-semibold">Voter IP</TableHead>
            <TableHead className="font-semibold">Payment</TableHead>
            <TableHead className="font-semibold">Votes</TableHead>
            <TableHead className="font-semibold">Fraud Score</TableHead>
            <TableHead className="font-semibold text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {votes.map((vote) => (
            <TableRow
              key={vote.voteId}
              className={`hover:bg-slate-50 ${vote.status === 'FLAGGED' ? 'bg-red-50' : ''} ${vote.status === 'BLOCKED' ? 'bg-red-100' : ''}`}
            >
              <TableCell>
                <input
                  type="checkbox"
                  className="rounded border-gray-300"
                  checked={selectedRows.has(vote.voteId)}
                  onChange={() => toggleRow(vote.voteId)}
                />
              </TableCell>
              <TableCell className="font-mono text-sm">{vote.voteId.slice(-6)}</TableCell>
              <TableCell className="text-sm">{formatTime(vote.timestamp)}</TableCell>
              <TableCell className="text-sm font-medium">{vote.contestantId}</TableCell>
              <TableCell className="font-mono text-sm">{vote.voterIp}</TableCell>
              <TableCell>
                <span className={`text-xs px-2 py-1 rounded ${getPaymentStatusColor(vote.paymentStatus)}`}>
                  {vote.paymentStatus}
                </span>
              </TableCell>
              <TableCell className="text-sm">{vote.voteCount}</TableCell>
              <TableCell>
                <VoteFraudBadge status={vote.status} fraudScore={vote.fraudScore} />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetails?.(vote)}
                    title="View details"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  {vote.fraudScore > 50 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onBlockIp?.(vote.voterIp)}
                      title="Block IP"
                    >
                      <Lock className="w-4 h-4" />
                    </Button>
                  )}
                  {vote.status === 'VALID' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onFlagVote?.(vote.voteId)}
                      title="Flag vote"
                    >
                      <AlertTriangle className="w-4 h-4" />
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
