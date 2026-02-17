import type { Metadata } from 'next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

export const metadata: Metadata = {
  title: 'Queue & Job Monitor - Admin',
  description: 'Monitor and manage background job queues and processing',
};

export default function JobsPage() {
  // Generate mock data for this session
  const activeJobs = generateActiveJobsList(8);
  const failedJobs = generateFailedJobsList(12);
  const completedJobs = generateCompletedJobsList(15);
  const dlqJobs = generateDLQJobsList(3);
  const queueMetrics = generateQueueMetrics();
  const jobsOverTime = generateJobsOverTimeData(24);
  const processingLatency = generateProcessingLatencyData(24);

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
                  {Math.floor(Math.random() * 5)} processing
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
                  {(Math.random() * 10 + 2).toFixed(1)}s
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
                    jobs={activeJobs}
                    total={activeJobs.length}
                    onViewDetails={(job) => console.log('View job details:', job.id)}
                    onCancelJob={async (jobId) => {
                      console.log('Cancel job:', jobId);
                    }}
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
                    jobs={failedJobs}
                    total={failedJobs.length}
                    onRetry={async (jobId) => {
                      console.log('Retry job:', jobId);
                    }}
                    onViewDetails={(job) => console.log('View job details:', job.id)}
                    onViewLogs={(jobId) => console.log('View logs for:', jobId)}
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
                    jobs={completedJobs}
                    total={completedJobs.length}
                    onViewDetails={(job) => console.log('View job details:', job.id)}
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
                    jobs={dlqJobs}
                    total={dlqJobs.length}
                    userRole="super_admin"
                    onRetry={async (jobId) => {
                      console.log('Retry DLQ job:', jobId);
                    }}
                    onDelete={async (jobId) => {
                      console.log('Delete DLQ job:', jobId);
                    }}
                    onViewDetails={(job) => console.log('View job details:', job.id)}
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
      </div>
  );
}
