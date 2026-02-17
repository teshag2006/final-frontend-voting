'use client';

import { VoteAnalytics } from '@/types/reports';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ReportsVotingTabProps {
  data: VoteAnalytics;
  isLoading?: boolean;
}

export function ReportsVotingTab({ data, isLoading }: ReportsVotingTabProps) {
  if (isLoading) {
    return <div className="space-y-4"><div className="h-96 bg-slate-100 rounded animate-pulse" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-slate-600">Total Votes</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{data.totalVotes.toLocaleString()}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-600">Unique Voters</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{data.uniqueVoters.toLocaleString()}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-600">Avg Votes/User</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{data.averageVotesPerUser.toFixed(2)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-600">Top Contestant</p>
          <p className="text-lg font-semibold text-slate-900 mt-1">{data.topContestant.name}</p>
          <p className="text-sm text-slate-500">{data.topContestant.votes.toLocaleString()} votes</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-600">Top Category</p>
          <p className="text-lg font-semibold text-slate-900 mt-1">{data.topCategory.name}</p>
          <p className="text-sm text-slate-500">{data.topCategory.votes.toLocaleString()} votes</p>
        </Card>
        <Card className="p-4 border-orange-200 bg-orange-50">
          <p className="text-sm text-orange-600 font-semibold">Suspicious Spikes</p>
          <p className="text-2xl font-bold text-orange-700 mt-1">{data.suspiciousSpikes}</p>
        </Card>
      </div>

      {/* Trend Table */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-slate-900">Vote Trend (Last 30 Days)</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Votes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.trendData.slice(-10).map((item) => (
              <TableRow key={item.date}>
                <TableCell className="text-sm">{item.date}</TableCell>
                <TableCell className="text-right font-medium">{item.votes?.toLocaleString() || 0}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
