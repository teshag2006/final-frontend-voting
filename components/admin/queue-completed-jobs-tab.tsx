'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { JobStatusBadge } from './job-status-badge';
import { CompletedJob, PaginationParams } from '@/types/queue-job';
import {
  formatDuration,
  formatDate,
  getQueueDisplayName,
  getJobTypeDisplayName,
} from '@/lib/queue-job-mock';

interface CompletedJobsTabProps {
  jobs: CompletedJob[];
  total: number;
  loading?: boolean;
  onViewDetails?: (job: CompletedJob) => void;
  onPaginationChange?: (params: PaginationParams) => void;
  pagination?: PaginationParams;
}

export function CompletedJobsTab({
  jobs,
  total,
  loading = false,
  onViewDetails,
  onPaginationChange,
  pagination = { page: 1, pageSize: 10 },
}: CompletedJobsTabProps) {
  const totalPages = Math.ceil(total / pagination.pageSize);
  const startIndex = (pagination.page - 1) * pagination.pageSize + 1;
  const endIndex = Math.min(pagination.page * pagination.pageSize, total);

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[12%]">Job ID</TableHead>
              <TableHead className="w-[15%]">Queue</TableHead>
              <TableHead className="w-[12%]">Type</TableHead>
              <TableHead className="w-[15%]">Completed At</TableHead>
              <TableHead className="w-[10%] text-right">Duration</TableHead>
              <TableHead className="w-[20%]">Result</TableHead>
              <TableHead className="w-[16%] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Loading completed jobs...
                </TableCell>
              </TableRow>
            ) : jobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No completed jobs
                </TableCell>
              </TableRow>
            ) : (
              jobs.map((job) => (
                <TableRow key={job.id} className="hover:bg-muted/50">
                  <TableCell className="font-mono text-xs truncate" title={job.id}>
                    {job.id.substring(0, 10)}...
                  </TableCell>
                  <TableCell className="text-sm">
                    <span className="text-muted-foreground">
                      {getQueueDisplayName(job.queueName)}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">
                    {getJobTypeDisplayName(job.jobType)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(job.completedAt)}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    <Badge variant="outline">
                      {formatDuration(job.duration)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm truncate max-w-xs" title={job.resultSummary}>
                    {job.resultSummary || 'No result available'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDetails?.(job)}
                      disabled={loading}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Info */}
      <div className="flex items-center justify-between px-4">
        <p className="text-sm text-muted-foreground">
          Showing {startIndex} to {endIndex} of {total} jobs
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPaginationChange?.({ ...pagination, page: pagination.page - 1 })}
            disabled={pagination.page === 1 || loading}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled
            className="cursor-default"
          >
            Page {pagination.page} of {totalPages}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPaginationChange?.({ ...pagination, page: pagination.page + 1 })}
            disabled={pagination.page === totalPages || loading}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm">
        <p className="text-blue-900 dark:text-blue-100">
          <strong>Note:</strong> Completed jobs are retained for {Math.floor(Math.random() * 30) + 7} days based on system retention policy. Configure retention in settings.
        </p>
      </div>
    </div>
  );
}
