'use client';

import { useState } from 'react';
import { MoreVertical, ChevronUp, ChevronDown } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FraudRiskBadge } from './fraud-risk-badge';
import { FraudCaseStatusBadge } from './fraud-case-status-badge';
import { formatDate, formatIP } from '@/lib/fraud-monitoring-utils';

export interface FraudCase {
  id: string;
  caseId: string;
  type: 'VOTE' | 'PAYMENT' | 'LOGIN';
  userId: string;
  contestant?: string;
  event: string;
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  ipAddress: string;
  deviceFingerprint: string;
  status: 'OPEN' | 'REVIEWED' | 'BLOCKED' | 'OVERRIDDEN';
  timestamp: string;
  metadata?: Record<string, any>;
}

interface FraudCasesTableProps {
  cases: FraudCase[];
  isLoading?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (column: string) => void;
  onViewDetails?: (caseId: string) => void;
  onMarkReviewed?: (caseId: string) => void;
  onBlockIP?: (ip: string) => void;
  onBlockDevice?: (deviceId: string) => void;
  onOverride?: (caseId: string) => void;
  onEscalate?: (caseId: string) => void;
}

const sortableColumns = ['caseId', 'type', 'riskScore', 'timestamp', 'status'];

export function FraudCasesTable({
  cases,
  isLoading = false,
  sortBy = '',
  sortOrder = 'desc',
  onSort,
  onViewDetails,
  onMarkReviewed,
  onBlockIP,
  onBlockDevice,
  onOverride,
  onEscalate,
}: FraudCasesTableProps) {
  const renderSortIcon = (column: string) => {
    if (sortBy !== column) return null;
    return sortOrder === 'asc' ? (
      <ChevronUp className="h-4 w-4 inline" />
    ) : (
      <ChevronDown className="h-4 w-4 inline" />
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (cases.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No fraud cases found matching your filters
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="cursor-pointer" onClick={() => onSort?.('caseId')}>
              Case ID {renderSortIcon('caseId')}
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => onSort?.('type')}>
              Type {renderSortIcon('type')}
            </TableHead>
            <TableHead>User ID</TableHead>
            <TableHead>Contestant</TableHead>
            <TableHead>Event</TableHead>
            <TableHead className="cursor-pointer" onClick={() => onSort?.('riskScore')}>
              Risk Score {renderSortIcon('riskScore')}
            </TableHead>
            <TableHead>Level</TableHead>
            <TableHead>IP Address</TableHead>
            <TableHead>Device FP</TableHead>
            <TableHead className="cursor-pointer" onClick={() => onSort?.('status')}>
              Status {renderSortIcon('status')}
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => onSort?.('timestamp')}>
              Timestamp {renderSortIcon('timestamp')}
            </TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cases.map((fraudCase) => (
            <TableRow key={fraudCase.id} className="hover:bg-muted/50">
              <TableCell className="font-mono text-sm font-semibold">
                {fraudCase.caseId}
              </TableCell>
              <TableCell>
                <span className="text-xs bg-muted px-2 py-1 rounded font-mono">
                  {fraudCase.type}
                </span>
              </TableCell>
              <TableCell className="font-mono text-xs">{fraudCase.userId}</TableCell>
              <TableCell className="text-sm">
                {fraudCase.contestant || '—'}
              </TableCell>
              <TableCell className="text-sm">{fraudCase.event}</TableCell>
              <TableCell>
                <FraudRiskBadge
                  level={fraudCase.riskLevel}
                  score={fraudCase.riskScore}
                  showScore
                  compact
                />
              </TableCell>
              <TableCell>
                <span className="text-xs px-2 py-1 rounded">{fraudCase.riskLevel}</span>
              </TableCell>
              <TableCell className="font-mono text-xs">
                {formatIP(fraudCase.ipAddress)}
              </TableCell>
              <TableCell className="font-mono text-xs">
                {fraudCase.deviceFingerprint.substring(0, 8)}...
              </TableCell>
              <TableCell>
                <FraudCaseStatusBadge status={fraudCase.status} compact />
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {formatDate(fraudCase.timestamp)}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewDetails?.(fraudCase.id)}>
                      View Details
                    </DropdownMenuItem>
                    {fraudCase.status === 'OPEN' && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onMarkReviewed?.(fraudCase.id)}>
                          Mark as Reviewed
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onBlockIP?.(fraudCase.ipAddress)}>
                          Block IP
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onBlockDevice?.(fraudCase.deviceFingerprint)}>
                          Block Device
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onOverride?.(fraudCase.id)}>
                          Override Risk
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEscalate?.(fraudCase.id)}>
                          Escalate
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
