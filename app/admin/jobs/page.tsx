 'use client';

import { useMemo, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AdminHeader } from '@/components/admin/admin-header';
import { ActiveJobsTab } from '@/components/admin/queue-active-jobs-tab';
import { FailedJobsTab } from '@/components/admin/queue-failed-jobs-tab';
import { CompletedJobsTab } from '@/components/admin/queue-completed-jobs-tab';
import { QueueMetricsTab } from '@/components/admin/queue-metrics-tab';
import { DLQTab } from '@/components/admin/queue-dlq-tab';
import {
  generateActiveJobsList,
  generateFailedJobsList,
  generateCompletedJobsList,
  generateDLQJobsList,
  generateQueueMetrics,
  generateJobsOverTimeData,
  generateProcessingLatencyData,
} from '@/lib/queue-job-mock';
import type { PaginationParams } from '@/types/queue-job';

export default function JobsPage() {
  const [activeJobs, setActiveJobs] = useState(() => generateActiveJobsList(8));
  const [failedJobs, setFailedJobs] = useState(() => generateFailedJobsList(12));
  const [completedJobs, setCompletedJobs] = useState(() => generateCompletedJobsList(15));
  const [dlqJobs, setDlqJobs] = useState(() => generateDLQJobsList(3));
  const [queueMetrics] = useState(() => generateQueueMetrics());
  const [jobsOverTime] = useState(() => generateJobsOverTimeData(24));
  const [processingLatency] = useState(() => generateProcessingLatencyData(24));

  const [activePagination, setActivePagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  const [failedPagination, setFailedPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  const [completedPagination, setCompletedPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  const [dlqPagination, setDlqPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });

  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [logJobId, setLogJobId] = useState<string | null>(null);

  const pagedActiveJobs = useMemo(() => {
    const start = (activePagination.page - 1) * activePagination.pageSize;
    return activeJobs.slice(start, start + activePagination.pageSize);
  }, [activeJobs, activePagination]);

  const pagedFailedJobs = useMemo(() => {
    const start = (failedPagination.page - 1) * failedPagination.pageSize;
    return failedJobs.slice(start, start + failedPagination.pageSize);
  }, [failedJobs, failedPagination]);

  const pagedCompletedJobs = useMemo(() => {
    const start = (completedPagination.page - 1) * completedPagination.pageSize;
    return completedJobs.slice(start, start + completedPagination.pageSize);
  }, [completedJobs, completedPagination]);

  const pagedDlqJobs = useMemo(() => {
    const start = (dlqPagination.page - 1) * dlqPagination.pageSize;
    return dlqJobs.slice(start, start + dlqPagination.pageSize);
  }, [dlqJobs, dlqPagination]);

  const currentlyProcessing = activeJobs.filter((job) => job.status === 'ACTIVE').length;
  const avgProcessingSeconds = useMemo(() => {
    if (queueMetrics.length === 0) return 0;
    const avg = queueMetrics.reduce((sum, metric) => sum + Number(metric.averageDuration || 0), 0) / queueMetrics.length;
    return Number(avg.toFixed(1));
  }, [queueMetrics]);

  const openJobDetails = (job: any) => {
    setSelectedJob(job);
  };

  const mockLogsForJob = (jobId: string) => [
    `[${new Date().toISOString()}] worker-01: picked job ${jobId}`,
    `[${new Date().toISOString()}] worker-01: validating payload`,
    `[${new Date().toISOString()}] worker-01: retry policy checked`,
    `[${new Date().toISOString()}] worker-01: completed log stream`,
  ].join('\n');

  return (
    <div className="min-h-screen bg-background">
        {/* Admin Header */}
        <AdminHeader />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Page Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Queue & Job Monitor</h1>
            <p className="text-muted-foreground">
              Monitor background jobs, queues, and processing metrics in real-time
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Jobs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{activeJobs.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {currentlyProcessing} processing
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Failed Jobs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-destructive">{failedJobs.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Pending retry/manual action
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  DLQ Jobs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{dlqJobs.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Permanently failed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avg Processing Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {avgProcessingSeconds}s
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Last 24 hours
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="active" className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="active">
                Active
                <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                  {activeJobs.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="failed">
                Failed
                <span className="ml-2 inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">
                  {failedJobs.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed
                <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
                  {completedJobs.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
              <TabsTrigger value="dlq">
                DLQ
                <span className="ml-2 inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-800">
                  {dlqJobs.length}
                </span>
              </TabsTrigger>
            </TabsList>

            {/* Active Jobs Tab */}
            <TabsContent value="active">
              <Card>
                <CardHeader>
                  <CardTitle>Active Jobs</CardTitle>
                  <CardDescription>
                    Jobs currently being processed or waiting to be processed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ActiveJobsTab
                    jobs={pagedActiveJobs}
                    total={activeJobs.length}
                    onViewDetails={openJobDetails}
                    onCancelJob={async (jobId) => {
                      setActiveJobs((prev) => prev.filter((job) => job.id !== jobId));
                    }}
                    onPaginationChange={setActivePagination}
                    pagination={activePagination}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Failed Jobs Tab */}
            <TabsContent value="failed">
              <Card>
                <CardHeader>
                  <CardTitle>Failed Jobs</CardTitle>
                  <CardDescription>
                    Jobs that failed and can be retried
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FailedJobsTab
                    jobs={pagedFailedJobs}
                    total={failedJobs.length}
                    onRetry={async (jobId) => {
                      setFailedJobs((prev) => {
                        const target = prev.find((job) => job.id === jobId);
                        if (target) {
                          setActiveJobs((activePrev) => [
                            {
                              id: `retry_${target.id}`,
                              queueName: target.queueName,
                              jobType: target.jobType,
                              status: 'WAITING',
                              priority: 'HIGH',
                              attempts: target.attempts,
                              maxRetries: target.maxRetries,
                              startedAt: new Date(),
                            },
                            ...activePrev,
                          ]);
                        }
                        return prev.filter((job) => job.id !== jobId);
                      });
                    }}
                    onViewDetails={openJobDetails}
                    onViewLogs={(jobId) => setLogJobId(jobId)}
                    onPaginationChange={setFailedPagination}
                    pagination={failedPagination}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Completed Jobs Tab */}
            <TabsContent value="completed">
              <Card>
                <CardHeader>
                  <CardTitle>Completed Jobs</CardTitle>
                  <CardDescription>
                    Successfully processed jobs (retention policy applies)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CompletedJobsTab
                    jobs={pagedCompletedJobs}
                    total={completedJobs.length}
                    onViewDetails={openJobDetails}
                    onPaginationChange={setCompletedPagination}
                    pagination={completedPagination}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Metrics Tab */}
            <TabsContent value="metrics">
              <QueueMetricsTab
                metrics={queueMetrics}
                jobsOverTime={jobsOverTime}
                processingLatency={processingLatency}
              />
            </TabsContent>

            {/* DLQ Tab */}
            <TabsContent value="dlq">
              <Card>
                <CardHeader>
                  <CardTitle>Dead Letter Queue</CardTitle>
                  <CardDescription>
                    Permanently failed jobs after exhausting retries
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DLQTab
                    jobs={pagedDlqJobs}
                    total={dlqJobs.length}
                    userRole="super_admin"
                    onRetry={async (jobId) => {
                      setDlqJobs((prev) => {
                        const target = prev.find((job) => job.id === jobId);
                        if (target) {
                          setActiveJobs((activePrev) => [
                            {
                              id: `dlq_retry_${target.id}`,
                              queueName: target.queueName,
                              jobType: target.jobType,
                              status: 'WAITING',
                              priority: 'HIGH',
                              attempts: 0,
                              maxRetries: target.maxRetries,
                              startedAt: new Date(),
                            },
                            ...activePrev,
                          ]);
                        }
                        return prev.filter((job) => job.id !== jobId);
                      });
                    }}
                    onDelete={async (jobId) => {
                      setDlqJobs((prev) => prev.filter((job) => job.id !== jobId));
                    }}
                    onViewDetails={openJobDetails}
                    onPaginationChange={setDlqPagination}
                    pagination={dlqPagination}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Help Section */}
          <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-base">Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <strong>Active Jobs:</strong> Currently processing or waiting. Click "Cancel" to abort (confirmation required).
              </p>
              <p>
                <strong>Failed Jobs:</strong> Can be retried. System will attempt up to 3 retries with exponential backoff.
              </p>
              <p>
                <strong>DLQ:</strong> Permanently failed jobs. Retry or delete (SUPER_ADMIN only). All actions are audited.
              </p>
              <p>
                <strong>Metrics:</strong> Real-time queue health, processing rates, and historical trends.
              </p>
            </CardContent>
          </Card>
        </main>

        <Dialog open={Boolean(selectedJob)} onOpenChange={(open) => !open && setSelectedJob(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Job Details</DialogTitle>
            </DialogHeader>
            {selectedJob ? (
              <pre className="max-h-[60vh] overflow-auto rounded-md border border-border bg-muted/30 p-3 text-xs">
{JSON.stringify(selectedJob, null, 2)}
              </pre>
            ) : null}
          </DialogContent>
        </Dialog>

        <Dialog open={Boolean(logJobId)} onOpenChange={(open) => !open && setLogJobId(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Job Logs</DialogTitle>
            </DialogHeader>
            {logJobId ? (
              <pre className="max-h-[60vh] overflow-auto rounded-md border border-border bg-muted/30 p-3 text-xs">
{mockLogsForJob(logJobId)}
              </pre>
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
  );
}
