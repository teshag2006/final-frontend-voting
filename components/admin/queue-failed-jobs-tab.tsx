'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { JobStatusBadge } from './job-status-badge';
import { FailedJob, PaginationParams } from '@/types/queue-job';
import {
  formatDate,
  getQueueDisplayName,
  getJobTypeDisplayName,
} from '@/lib/queue-job-mock';

interface FailedJobsTabProps {
  jobs: FailedJob[];
  total: number;
  loading?: boolean;
  onRetry?: (jobId: string) => Promise<void>;
  onViewDetails?: (job: FailedJob) => void;
  onViewLogs?: (jobId: string) => void;
  onPaginationChange?: (params: PaginationParams) => void;
  pagination?: PaginationParams;
}

export function FailedJobsTab({
  jobs,
  total,
  loading = false,
  onRetry,
  onViewDetails,
  onViewLogs,
  onPaginationChange,
  pagination = { page: 1, pageSize: 10 },
}: FailedJobsTabProps) {
  const [retryingJobId, setRetryingJobId] = useState<string | null>(null);
  const [showRetryDialog, setShowRetryDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRetryClick = (jobId: string) => {
    setRetryingJobId(jobId);
    setShowRetryDialog(true);
  };

  const handleConfirmRetry = async () => {
    if (!retryingJobId || !onRetry) return;

    setIsSubmitting(true);
    try {
      await onRetry(retryingJobId);
    } finally {
      setIsSubmitting(false);
      setShowRetryDialog(false);
      setRetryingJobId(null);
    }
  };

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
              <TableHead className="w-[14%]">Queue</TableHead>
              <TableHead className="w-[12%]">Type</TableHead>
              <TableHead className="w-[20%]">Failure Reason</TableHead>
              <TableHead className="w-[8%] text-right">Attempts</TableHead>
              <TableHead className="w-[14%]">Failed At</TableHead>
              <TableHead className="w-[20%] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Loading failed jobs...
                </TableCell>
              </TableRow>
            ) : jobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No failed jobs
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
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {job.failureReason}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {job.attempts}/{job.maxRetries}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {job.failedAt ? formatDate(job.failedAt) : '-'}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDetails?.(job)}
                      disabled={loading}
                    >
                      Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewLogs?.(job.id)}
                      disabled={loading}
                    >
                      Logs
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleRetryClick(job.id)}
                      disabled={loading}
                    >
                      Retry
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

      {/* Retry Confirmation Dialog */}
      <AlertDialog open={showRetryDialog} onOpenChange={setShowRetryDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Retry Failed Job?</AlertDialogTitle>
            <AlertDialogDescription>
              This job will be re-queued and will retry from the beginning.
              Ensure the underlying issue has been resolved before retrying.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="bg-muted p-3 rounded text-sm space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Job ID:</span>
              <span className="font-mono text-xs">{retryingJobId?.substring(0, 20)}...</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Retries:</span>
              <span className="font-mono text-xs">2/3</span>
            </div>
          </div>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmRetry}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Retrying...' : 'Retry Job'}
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
