'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BlockchainSummary } from '@/types/blockchain-monitor';
import { AlertTriangle, CheckCircle2, Clock, XCircle } from 'lucide-react';

interface BlockchainSummaryCardsProps {
  summary: BlockchainSummary;
  isLoading?: boolean;
}

export function BlockchainSummaryCards({ summary, isLoading }: BlockchainSummaryCardsProps) {
  const formatDate = (date: Date) => new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const CardSkeleton = () => (
    <div className="h-20 bg-gradient-to-r from-slate-200 to-slate-100 rounded-lg animate-pulse" />
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card className="border-l-4 border-l-green-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Confirmed Anchors</CardTitle>
          <CheckCircle2 className="w-4 h-4 text-green-600" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <CardSkeleton />
          ) : (
            <>
              <div className="text-2xl font-bold">{summary.confirmedAnchors}</div>
              <p className="text-xs text-muted-foreground">of {summary.totalAnchors} total</p>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-yellow-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Anchors</CardTitle>
          <Clock className="w-4 h-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <CardSkeleton />
          ) : (
            <>
              <div className="text-2xl font-bold">{summary.pendingAnchors}</div>
              <p className="text-xs text-muted-foreground">awaiting confirmation</p>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-red-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Failed Anchors</CardTitle>
          <XCircle className="w-4 h-4 text-red-600" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <CardSkeleton />
          ) : (
            <>
              <div className="text-2xl font-bold">{summary.failedAnchors}</div>
              <p className="text-xs text-muted-foreground">requires retry</p>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-blue-500 md:col-span-2 lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Confirmation</CardTitle>
          <Clock className="w-4 h-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <CardSkeleton />
          ) : (
            <>
              <div className="text-2xl font-bold">{summary.avgConfirmationTime}s</div>
              <p className="text-xs text-muted-foreground">average time</p>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-orange-500 md:col-span-2 lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Last Anchored</CardTitle>
          <AlertTriangle className="w-4 h-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <CardSkeleton />
          ) : (
            <>
              <div className="text-lg font-semibold">{formatDate(summary.lastAnchoredAt)}</div>
              <p className="text-xs text-muted-foreground">
                {summary.integrityAlerts > 0 ? `${summary.integrityAlerts} integrity alerts` : 'No alerts'}
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
