'use client';

import { Card } from '@/components/ui/card';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertCircle, Gauge } from 'lucide-react';
import type { ResourceMetrics } from '@/types/health-monitor';

interface HealthResourceMetricsProps {
  metrics: ResourceMetrics;
}

export function HealthResourceMetrics({ metrics }: HealthResourceMetricsProps) {
  // Prepare chart data
  const chartData = metrics.cpuHistory.map((cpu, idx) => ({
    time: `${idx}h`,
    cpu,
    memory: metrics.memoryHistory[idx],
    connections: Math.round(metrics.connectionHistory[idx] / 100),
  }));

  const getMetricColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-amber-600';
    return 'text-green-600';
  };

  const getMetricBgColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-100/20 border-red-200/50';
    if (percentage >= 75) return 'bg-amber-100/20 border-amber-200/50';
    return 'bg-green-100/20 border-green-200/50';
  };

  return (
    <div className="space-y-6">
      {/* Resource Usage Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        {/* CPU */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">CPU</p>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className={`text-2xl font-bold ${getMetricColor(metrics.cpu.current)}`}>{metrics.cpu.current}%</p>
          <p className="text-xs text-muted-foreground mt-2">Avg: {metrics.cpu.avg}% | Peak: {metrics.cpu.peak}%</p>
        </Card>

        {/* Memory */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Memory</p>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className={`text-2xl font-bold ${getMetricColor(metrics.memory.current)}`}>{metrics.memory.current}%</p>
          <p className="text-xs text-muted-foreground mt-2">
            Avg: {metrics.memory.avg}% | Peak: {metrics.memory.peak}%
          </p>
        </Card>

        {/* Disk */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Disk</p>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className={`text-2xl font-bold ${getMetricColor(metrics.disk.current)}`}>{metrics.disk.current}%</p>
          <p className="text-xs text-muted-foreground mt-2">
            Avg: {metrics.disk.avg}% | Peak: {metrics.disk.peak}%
          </p>
        </Card>

        {/* Connections */}
        <Card className={`p-4 border rounded-lg ${getMetricBgColor(metrics.connections.percentage)}`}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Connections</p>
          </div>
          <p className={`text-2xl font-bold ${getMetricColor(metrics.connections.percentage)}`}>
            {metrics.connections.active}/{metrics.connections.total}
          </p>
          <p className={`text-xs font-medium mt-2 ${getMetricColor(metrics.connections.percentage)}`}>
            {metrics.connections.percentage}% utilized
          </p>
        </Card>

        {/* DB Pool */}
        <Card className={`p-4 border rounded-lg ${getMetricBgColor(metrics.dbPoolUsage.percentage)}`}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">DB Pool</p>
          </div>
          <p className={`text-2xl font-bold ${getMetricColor(metrics.dbPoolUsage.percentage)}`}>
            {metrics.dbPoolUsage.active}/{metrics.dbPoolUsage.total}
          </p>
          <p className={`text-xs font-medium mt-2 ${getMetricColor(metrics.dbPoolUsage.percentage)}`}>
            {metrics.dbPoolUsage.percentage}% utilized
          </p>
        </Card>

        {/* Redis Memory */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Redis</p>
          </div>
          <p className={`text-2xl font-bold ${getMetricColor(metrics.redisMemory.percentage)}`}>
            {metrics.redisMemory.used}MB
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            of {metrics.redisMemory.total}MB ({metrics.redisMemory.percentage}%)
          </p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* CPU & Memory Chart */}
        <Card className="p-6">
          <h4 className="font-semibold text-foreground mb-4">CPU & Memory Trend (24h)</h4>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorMemory" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
              <XAxis dataKey="time" stroke="rgba(0,0,0,0.5)" />
              <YAxis stroke="rgba(0,0,0,0.5)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  border: '1px solid rgba(0,0,0,0.1)',
                  borderRadius: '6px',
                }}
              />
              <Area type="monotone" dataKey="cpu" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCpu)" />
              <Area type="monotone" dataKey="memory" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorMemory)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Connections Trend */}
        <Card className="p-6">
          <h4 className="font-semibold text-foreground mb-4">Active Connections (24h)</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
              <XAxis dataKey="time" stroke="rgba(0,0,0,0.5)" />
              <YAxis stroke="rgba(0,0,0,0.5)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  border: '1px solid rgba(0,0,0,0.1)',
                  borderRadius: '6px',
                }}
              />
              <Line
                type="monotone"
                dataKey="connections"
                stroke="#10b981"
                dot={false}
                strokeWidth={2}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Warning if resources critical */}
      {(metrics.cpu.current >= 90 ||
        metrics.memory.current >= 90 ||
        metrics.dbPoolUsage.percentage >= 90) && (
        <div className="p-4 rounded-lg bg-red-100/20 border border-red-200/50 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-red-900 text-sm">Resource Utilization Critical</p>
            <p className="text-xs text-red-800 mt-1">One or more resources are at critical levels. Consider scaling infrastructure.</p>
          </div>
        </div>
      )}
    </div>
  );
}
