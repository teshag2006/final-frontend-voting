'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ActivityRow {
  date: string;
  category: string;
  contestant: string;
  voteType: 'free' | 'paid';
  status: 'confirmed' | 'under-review' | 'failed';
}

interface RecentActivityTableProps {
  activities: ActivityRow[];
  isLoading?: boolean;
}

export function RecentActivityTable({
  activities,
  isLoading = false,
}: RecentActivityTableProps) {
  const getVoteTypeBadge = (type: string) => {
    if (type === 'free') {
      return (
        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
          Free
        </Badge>
      );
    }
    return (
      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
        Paid
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <Badge variant="secondary" className="bg-blue-50 text-blue-700">
            Confirmed
          </Badge>
        );
      case 'under-review':
        return (
          <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
            Under Review
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive">Failed</Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="flex h-40 items-center justify-center">
            <p className="text-sm text-muted-foreground">No recent activity</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-semibold">Date</TableHead>
                  <TableHead className="text-xs font-semibold">Category</TableHead>
                  <TableHead className="text-xs font-semibold">Contestant</TableHead>
                  <TableHead className="text-xs font-semibold">Vote Type</TableHead>
                  <TableHead className="text-xs font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.map((activity, idx) => (
                  <TableRow key={idx} className="text-sm">
                    <TableCell className="text-muted-foreground">
                      {activity.date}
                    </TableCell>
                    <TableCell>{activity.category}</TableCell>
                    <TableCell>{activity.contestant}</TableCell>
                    <TableCell>{getVoteTypeBadge(activity.voteType)}</TableCell>
                    <TableCell>{getStatusBadge(activity.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
