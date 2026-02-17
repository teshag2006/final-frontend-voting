'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Shield } from 'lucide-react';

interface VoterSummaryCardProps {
  eventName: string;
  remainingVotes: number;
  freeVotesUsed: number;
  freeVotesLimit: number;
  paidVotesUsed: number;
  totalTransactions: number;
}

export function VoterSummaryCard({
  eventName,
  remainingVotes,
  freeVotesUsed,
  freeVotesLimit,
  paidVotesUsed,
  totalTransactions,
}: VoterSummaryCardProps) {
  return (
    <Card className="mb-6 border-0 bg-gradient-to-br from-blue-50 to-white shadow-md">
      <CardHeader className="pb-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome Back, Voter!</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Event: <span className="font-semibold text-foreground">{eventName}</span>
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Remaining Votes Banner */}
        <div className="rounded-lg bg-primary p-4 text-white shadow-md sm:p-6">
          <p className="text-sm font-medium opacity-90">Remaining Votes</p>
          <p className="text-4xl font-bold tracking-tight sm:text-5xl">{remainingVotes}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <div className="rounded-lg border border-border bg-white p-4">
            <p className="text-xs font-medium text-muted-foreground sm:text-sm">Free Votes Used</p>
            <p className="mt-2 text-lg font-semibold text-foreground sm:text-xl">
              {freeVotesUsed} <span className="text-xs font-normal text-muted-foreground">/ {freeVotesLimit}</span>
            </p>
          </div>
          <div className="rounded-lg border border-border bg-white p-4">
            <p className="text-xs font-medium text-muted-foreground sm:text-sm">Paid Votes Used</p>
            <p className="mt-2 text-lg font-semibold text-foreground sm:text-xl">{paidVotesUsed}</p>
          </div>
          <div className="rounded-lg border border-border bg-white p-4">
            <p className="text-xs font-medium text-muted-foreground sm:text-sm">Transactions</p>
            <p className="mt-2 text-lg font-semibold text-foreground sm:text-xl">{totalTransactions}</p>
          </div>
        </div>

        {/* Security Note */}
        <div className="flex items-center gap-2 border-t border-border pt-4">
          <Shield className="h-4 w-4 text-green-600" />
          <p className="text-xs text-muted-foreground sm:text-sm">
            All votes are secured and blockchain-anchored.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
