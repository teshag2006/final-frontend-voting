'use client';

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  QueueMetrics,
  JobsOverTimeDataPoint,
  ProcessingLatencyDataPoint,
} from '@/types/queue-job';
import { getQueueDisplayName } from '@/lib/queue-job-mock';

interface QueueMetricsTabProps {
  metrics: QueueMetrics[];
  jobsOverTime: JobsOverTimeDataPoint[];
  processingLatency: ProcessingLatencyDataPoint[];
  loading?: boolean;
}

export function QueueMetricsTab({
  metrics,
  jobsOverTime,
  processingLatency,
  loading = false,
}: QueueMetricsTabProps) {
  const formatChartDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const chartData = jobsOverTime.map((point) => ({
    ...point,
    timestamp: formatChartDate(point.timestamp),
  }));

  const latencyData = processingLatency.map((point) => ({
    ...point,
    timestamp: formatChartDate(point.timestamp),
  }));

  const getQueueHealthColor = (failureRate: number): string => {
    if (failureRate < 5) return '#10b981'; // green
    if (failureRate < 10) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  return (
    <div className="space-y-6">
      {/* Queue Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            Loading metrics...
          </div>
        ) : metrics.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            No queue metrics available
          </div>
        ) : (
          metrics.map((queue) => (
            <Card key={queue.queueName} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold">
                      {getQueueDisplayName(queue.queueName)}
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {queue.jobCount} jobs pending
                    </CardDescription>
                  </div>
                  <Badge
                    variant={queue.failureRate > 10 ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {queue.failureRate}% fail rate
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Processing Rate</p>
                    <p className="font-semibold">{queue.processingRate}/min</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Avg Duration</p>
                    <p className="font-semibold">{queue.averageDuration}s</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Workers</p>
                    <p className="font-semibold">{queue.workerCount}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Backlog</p>
                    <p className="font-semibold">{queue.backlogSize}</p>
                  </div>
                </div>

                {/* Health Indicator */}
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-semibold">Health</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full transition-all"
                        style={{
                          width: `${Math.max(0, 100 - queue.failureRate * 10)}%`,
                          backgroundColor: getQueueHealthColor(queue.failureRate),
                        }}
                      />
                    </div>
                    <span className="text-xs font-semibold">
                      {Math.round((100 - queue.failureRate * 10) * 10) / 10}%
                    </span>
                  </div>
                </div>

                {/* 24h Stats */}
                <div className="border-t pt-2 text-xs space-y-1">
                  <p className="text-muted-foreground">24h Stats</p>
                  <div className="flex justify-between">
                    <span>Processed: <strong>{queue.totalProcessed24h}</strong></span>
                    <span>Failed: <strong className="text-destructive">{queue.totalFailed24h}</strong></span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Jobs Over Time Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Jobs Over Time (24h)</CardTitle>
          <CardDescription>Processed, failed, and active jobs timeline</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="processed" stackId="a" fill="#10b981" name="Processed" />
              <Bar dataKey="failed" stackId="a" fill="#ef4444" name="Failed" />
              <Bar dataKey="active" stackId="a" fill="#3b82f6" name="Active" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Processing Latency Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Processing Latency Trend (24h)</CardTitle>
          <CardDescription>Average job processing latency over time</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={latencyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis label={{ value: 'Latency (ms)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => `${value}ms`} />
              <Legend />
              <Line
                type="monotone"
                dataKey="latency"
                stroke="#f59e0b"
                dot={false}
                name="Latency (ms)"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Key Metrics Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Key Performance Indicators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Total Queues</p>
              <p className="text-2xl font-bold">{metrics.length}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Total Pending</p>
              <p className="text-2xl font-bold">
                {metrics.reduce((sum, q) => sum + q.jobCount, 0)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Avg Failure Rate</p>
              <p className="text-2xl font-bold text-destructive">
                {Math.round(
                  metrics.reduce((sum, q) => sum + q.failureRate, 0) / metrics.length
                )}%
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Total Workers</p>
              <p className="text-2xl font-bold">
                {metrics.reduce((sum, q) => sum + q.workerCount, 0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
