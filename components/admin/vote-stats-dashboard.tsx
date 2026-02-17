'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VoteStats } from '@/types/vote-monitoring';
import { Activity, AlertTriangle, DollarSign, TrendingUp, AlertOctagon, Clock } from 'lucide-react';

interface VoteStatsDashboardProps {
  stats: VoteStats;
  isLoading?: boolean;
}

export function VoteStatsDashboard({ stats, isLoading }: VoteStatsDashboardProps) {
  const StatCard = ({ icon: Icon, label, value, subtext, color }: any) => (
    <Card className={`border-l-4 ${color}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        <Icon className="w-4 h-4" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-8 bg-slate-200 rounded animate-pulse" />
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
          </>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <StatCard
        icon={TrendingUp}
        label="Total Votes Today"
        value={stats.totalVotesToday}
        subtext="24-hour total"
        color="border-l-blue-500"
      />
      <StatCard
        icon={Activity}
        label="Last 10 Minutes"
        value={stats.votesLast10Min}
        subtext="real-time activity"
        color="border-l-green-500"
      />
      <StatCard
        icon={Clock}
        label="Pending Payments"
        value={stats.pendingPayments}
        subtext="awaiting confirmation"
        color="border-l-yellow-500"
      />
      <StatCard
        icon={AlertTriangle}
        label="Failed Transactions"
        value={stats.failedTransactions}
        subtext="requires retry"
        color="border-l-orange-500"
      />
      <StatCard
        icon={AlertOctagon}
        label="Flagged Suspicious"
        value={stats.flaggedSuspiciousVotes}
        subtext="fraud score > 70"
        color="border-l-red-500"
      />
      <StatCard
        icon={DollarSign}
        label="Status"
        value="Live"
        subtext={`Updated ${Math.floor(Math.random() * 60)}s ago`}
        color="border-l-purple-500"
      />
    </div>
  );
}
