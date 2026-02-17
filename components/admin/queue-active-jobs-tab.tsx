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
import { JobStatusBadge, JobPriorityBadge } from './job-status-badge';
import {
  Job,
  PaginationParams,
  JobDetailPayload,
} from '@/types/queue-job';
import {
  formatDuration,
  formatDate,
  getQueueDisplayName,
  getJobTypeDisplayName,
} from '@/lib/queue-job-mock';

interface ActiveJobsTabProps {
  jobs: Job[];
  total: number;
  loading?: boolean;
  onViewDetails?: (job: Job) => void;
  onCancelJob?: (jobId: string) => Promise<void>;
  onPaginationChange?: (params: PaginationParams) => void;
  pagination?: PaginationParams;
}

export function ActiveJobsTab({
  jobs,
  total,
  loading = false,
  onViewDetails,
  onCancelJob,
  onPaginationChange,
  pagination = { page: 1, pageSize: 10 },
}: ActiveJobsTabProps) {
  const [cancelingJobId, setCancelingJobId] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCancelClick = (jobId: string) => {
    setCancelingJobId(jobId);
    setShowCancelDialog(true);
  };

  const handleConfirmCancel = async () => {
    if (!cancelingJobId || !onCancelJob) return;

    setIsSubmitting(true);
    try {
      await onCancelJob(cancelingJobId);
    } finally {
      setIsSubmitting(false);
      setShowCancelDialog(false);
      setCancelingJobId(null);
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
              <TableHead className="w-[15%]">Job ID</TableHead>
              <TableHead className="w-[15%]">Queue</TableHead>
              <TableHead className="w-[12%]">Type</TableHead>
              <TableHead className="w-[10%]">Status</TableHead>
              <TableHead className="w-[8%] text-right">Priority</TableHead>
              <TableHead className="w-[8%] text-right">Attempts</TableHead>
              <TableHead className="w-[12%]">Duration</TableHead>
              <TableHead className="w-[12%] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Loading jobs...
                </TableCell>
              </TableRow>
            ) : jobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No active jobs at this time
                </TableCell>
              </TableRow>
            ) : (
              jobs.map((job) => (
                <TableRow key={job.id} className="hover:bg-muted/50">
                  <TableCell className="font-mono text-xs truncate" title={job.id}>
                    {job.id.substring(0, 12)}...
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
                    <JobStatusBadge status={job.status} size="sm" />
                  </TableCell>
                  <TableCell className="text-right">
                    <JobPriorityBadge priority={job.priority} size="sm" />
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {job.attempts}/{job.maxRetries}
                  </TableCell>
                  <TableCell className="text-sm">
                    {job.startedAt
                      ? formatDuration(new Date().getTime() - job.startedAt.getTime())
                      : '-'}
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
                      variant="destructive"
                      size="sm"
                      onClick={() => handleCancelClick(job.id)}
                      disabled={loading}
                    >
                      Cancel
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

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Job?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this job? This action cannot be undone.
              The job will be marked as cancelled and will not resume.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="bg-muted p-3 rounded text-sm font-mono text-muted-foreground">
            Job ID: {cancelingJobId?.substring(0, 20)}...
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Worker ID:</span>
              <span className="font-mono">worker_01</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Queue:</span>
              <span className="font-mono">blockchain-anchor-queue</span>
            </div>
          </div>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmCancel}
            disabled={isSubmitting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isSubmitting ? 'Cancelling...' : 'Cancel Job'}
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
