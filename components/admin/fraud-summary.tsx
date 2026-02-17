'use client';

import { AlertTriangle, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { FraudSummary as FraudSummaryType, FraudAlert } from '@/types/admin-overview';

interface FraudSummaryProps {
  summary: FraudSummaryType;
  alerts?: FraudAlert[];
}

export function FraudSummary({ summary, alerts = [] }: FraudSummaryProps) {
  const severityData = [
    { name: 'Critical', value: summary.critical, color: '#dc2626' },
    { name: 'High', value: summary.high, color: '#ea580c' },
    { name: 'Medium', value: summary.total - summary.critical - summary.high - summary.pending + summary.resolved, color: '#f59e0b' },
    { name: 'Low', value: summary.pending + summary.resolved - summary.total + summary.critical + summary.high, color: '#10b981' },
  ];

  const statusData = [
    { name: 'Pending', value: summary.pending, color: '#3b82f6' },
    { name: 'Resolved', value: summary.resolved, color: '#22c55e' },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Left Panel - Main Stats */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">Fraud Intelligence</h3>
          <AlertCircle className="h-5 w-5 text-amber-500" />
        </div>

        {/* Main Numbers */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-red-50 dark:bg-red-950/20">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical Alerts</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{summary.critical}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-red-600">{summary.criticalPercentage}%</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Severity</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">{summary.high}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-orange-600">
                {((summary.high / summary.total) * 100).toFixed(1)}%
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{summary.pending}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-blue-600">
                {((summary.pending / summary.total) * 100).toFixed(1)}%
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 dark:bg-green-950/20">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{summary.resolved}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-green-600">
                {((summary.resolved / summary.total) * 100).toFixed(1)}%
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-border mt-4">
            <p className="text-sm text-muted-foreground">Fraud Votes Removed</p>
            <p className="text-2xl font-bold text-foreground mt-2">
              {summary.fraudVotesRemoved.toLocaleString()}
            </p>
          </div>
        </div>
      </Card>

      {/* Right Panel - Charts */}
      <div className="space-y-6">
        {/* Severity Distribution */}
        <Card className="p-6">
          <h4 className="text-sm font-semibold text-foreground mb-4">Severity Distribution</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                  }}
                />
                <Legend layout="vertical" align="right" verticalAlign="middle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Status Breakdown */}
        <Card className="p-6">
          <h4 className="text-sm font-semibold text-foreground mb-4">Status Breakdown</h4>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
