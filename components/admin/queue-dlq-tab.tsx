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
import { DLQJob, PaginationParams } from '@/types/queue-job';
import {
  formatDate,
  getQueueDisplayName,
  getJobTypeDisplayName,
} from '@/lib/queue-job-mock';

interface DLQTabProps {
  jobs: DLQJob[];
  total: number;
  loading?: boolean;
  onRetry?: (jobId: string) => Promise<void>;
  onDelete?: (jobId: string) => Promise<void>;
  onViewDetails?: (job: DLQJob) => void;
  onPaginationChange?: (params: PaginationParams) => void;
  pagination?: PaginationParams;
  userRole?: 'admin' | 'super_admin';
}

export function DLQTab({
  jobs,
  total,
  loading = false,
  onRetry,
  onDelete,
  onViewDetails,
  onPaginationChange,
  pagination = { page: 1, pageSize: 10 },
  userRole = 'admin',
}: DLQTabProps) {
  const [actionJobId, setActionJobId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'retry' | 'delete' | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canDelete = userRole === 'super_admin';

  const handleAction = (jobId: string, type: 'retry' | 'delete') => {
    if (type === 'delete' && !canDelete) return;

    setActionJobId(jobId);
    setActionType(type);
    setShowDialog(true);
  };

  const handleConfirmAction = async () => {
    if (!actionJobId) return;

    setIsSubmitting(true);
    try {
      if (actionType === 'retry' && onRetry) {
        await onRetry(actionJobId);
      } else if (actionType === 'delete' && onDelete) {
        await onDelete(actionJobId);
      }
    } finally {
      setIsSubmitting(false);
      setShowDialog(false);
      setActionJobId(null);
      setActionType(null);
    }
  };

  const totalPages = Math.ceil(total / pagination.pageSize);
  const startIndex = (pagination.page - 1) * pagination.pageSize + 1;
  const endIndex = Math.min(pagination.page * pagination.pageSize, total);

  return (
    <div className="space-y-4">
      {/* Warning Banner */}
      <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">
          Dead Letter Queue
        </h3>
        <p className="text-sm text-red-800 dark:text-red-200">
          These jobs have permanently failed after exhausting all retry attempts. Manual intervention may be required. {' '}
          <strong>SUPER_ADMIN only</strong> can delete jobs from DLQ.
        </p>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[12%]">Job ID</TableHead>
              <TableHead className="w-[14%]">Queue</TableHead>
              <TableHead className="w-[12%]">Type</TableHead>
              <TableHead className="w-[18%]">Failure Reason</TableHead>
              <TableHead className="w-[10%] text-right">Attempts</TableHead>
              <TableHead className="w-[14%]">Failed At</TableHead>
              <TableHead className="w-[20%] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Loading DLQ jobs...
                </TableCell>
              </TableRow>
            ) : jobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No jobs in dead letter queue
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
                    <Badge variant="destructive" className="text-xs">
                      {job.failureReason}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {job.retryAttempts}/{job.maxRetries}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(job.failedAt)}
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
                      variant="default"
                      size="sm"
                      onClick={() => handleAction(job.id, 'retry')}
                      disabled={loading}
                    >
                      Retry
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleAction(job.id, 'delete')}
                      disabled={loading || !canDelete}
                      title={!canDelete ? 'Only SUPER_ADMIN can delete DLQ jobs' : ''}
                    >
                      Delete
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

      {/* Action Confirmation Dialog */}
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'delete' ? 'Delete DLQ Job?' : 'Retry DLQ Job?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'delete'
                ? 'This action cannot be undone. The job will be permanently removed from the DLQ. This action requires SUPER_ADMIN role and will be audited.'
                : 'This job will be moved back to active queue and will retry. Ensure the underlying issue has been resolved.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="bg-muted p-3 rounded text-sm space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Job ID:</span>
              <span className="font-mono text-xs">{actionJobId?.substring(0, 20)}...</span>
            </div>
            {actionType === 'delete' && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Audit:</span>
                <span className="font-mono text-xs">HIGH_RISK_DELETION</span>
              </div>
            )}
          </div>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmAction}
            disabled={isSubmitting}
            className={
              actionType === 'delete' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''
            }
          >
            {isSubmitting
              ? actionType === 'delete'
                ? 'Deleting...'
                : 'Retrying...'
              : actionType === 'delete'
                ? 'Delete Job'
                : 'Retry Job'}
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>

      {/* Permission Notice */}
      {!canDelete && (
        <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-sm">
          <p className="text-amber-900 dark:text-amber-100">
            <strong>Note:</strong> DLQ job deletion requires SUPER_ADMIN role. Contact your administrator if you need to delete permanently failed jobs.
          </p>
        </div>
      )}
    </div>
  );
}
