'use client';

import { useState } from 'react';
import { VirtualTable } from './virtual-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AlertTriangle, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FraudCase {
  id: string;
  timestamp: string;
  voteId: string;
  userId: string;
  contestantId: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  reason: string;
  status: 'pending' | 'reviewed' | 'confirmed' | 'dismissed';
  action: 'none' | 'quarantine' | 'block' | 'refund';
}

interface FraudPattern {
  patternId: string;
  name: string;
  count: number;
  lastDetected: string;
  severity: 'low' | 'medium' | 'high';
}

interface FraudDetectionDashboardProps {
  fraudCases: FraudCase[];
  fraudPatterns: FraudPattern[];
  fraudTrend: Array<{ time: string; count: number; severity: string }>;
  stats: {
    totalCases: number;
    blockedVotes: number;
    recoveredAmount: number;
    falsePositives: number;
  };
  onReviewCase?: (caseId: string) => void;
  onTakeAction?: (caseId: string, action: string) => void;
  isLoading?: boolean;
}

const riskLevelColors: Record<string, string> = {
  low: 'bg-green-500',
  medium: 'bg-yellow-500',
  high: 'bg-orange-500',
  critical: 'bg-red-500',
};

const riskLevelLabels: Record<string, string> = {
  low: 'Low Risk',
  medium: 'Medium Risk',
  high: 'High Risk',
  critical: 'Critical',
};

const statusColors: Record<string, string> = {
  pending: 'bg-blue-500',
  reviewed: 'bg-purple-500',
  confirmed: 'bg-red-500',
  dismissed: 'bg-gray-500',
};

const severityColors: Record<string, string> = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
};

export function FraudDetectionDashboard({
  fraudCases,
  fraudPatterns,
  fraudTrend,
  stats,
  onReviewCase,
  onTakeAction,
  isLoading = false,
}: FraudDetectionDashboardProps) {
  const [selectedCase, setSelectedCase] = useState<FraudCase | null>(null);

  const caseColumns = [
    {
      key: 'timestamp' as const,
      label: 'Time',
      width: 150,
      sortable: true,
      render: (value: string) => new Date(value).toLocaleTimeString(),
    },
    {
      key: 'userId' as const,
      label: 'User ID',
      width: 150,
      sortable: true,
    },
    {
      key: 'voteId' as const,
      label: 'Vote ID',
      width: 150,
      sortable: true,
    },
    {
      key: 'riskLevel' as const,
      label: 'Risk Level',
      width: 130,
      sortable: true,
      filterable: true,
      render: (value: string) => (
        <Badge className={cn('text-white', riskLevelColors[value])}>
          {riskLevelLabels[value] || value}
        </Badge>
      ),
    },
    {
      key: 'riskScore' as const,
      label: 'Score',
      width: 80,
      sortable: true,
      render: (value: number) => `${value.toFixed(1)}%`,
    },
    {
      key: 'status' as const,
      label: 'Status',
      width: 120,
      sortable: true,
      filterable: true,
      render: (value: string) => (
        <Badge className={cn('text-white', statusColors[value])}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      ),
    },
    {
      key: 'action' as const,
      label: 'Action',
      width: 120,
      render: (value: string) => (
        <Badge variant="outline">
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      ),
    },
  ];

  const patternColumns = [
    {
      key: 'name' as const,
      label: 'Pattern',
      width: 200,
      sortable: true,
    },
    {
      key: 'count' as const,
      label: 'Occurrences',
      width: 120,
      sortable: true,
      render: (value: number) => value.toLocaleString(),
    },
    {
      key: 'severity' as const,
      label: 'Severity',
      width: 120,
      sortable: true,
      filterable: true,
      render: (value: string) => (
        <Badge className={severityColors[value]}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      ),
    },
    {
      key: 'lastDetected' as const,
      label: 'Last Detected',
      width: 150,
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
  ];

  const statsCard = ({
    title,
    value,
    icon: Icon,
    trend,
    format = 'number',
  }: {
    title: string;
    value: number;
    icon: React.ReactNode;
    trend?: number;
    format?: 'number' | 'currency' | 'percentage';
  }) => {
    let formatted = value.toString();
    if (format === 'currency') formatted = `$${value.toLocaleString()}`;
    if (format === 'percentage') formatted = `${value}%`;

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <div className="text-muted-foreground">{Icon}</div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatted}</div>
          {trend !== undefined && (
            <p className={cn('text-xs', trend > 0 ? 'text-red-600' : 'text-green-600')}>
              {trend > 0 ? '+' : ''}
              {trend}% from last period
            </p>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold">Fraud Detection & Prevention</h2>
        <p className="text-muted-foreground">Monitor and manage suspicious voting activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCard({
          title: 'Total Fraud Cases',
          value: stats.totalCases,
          icon: <AlertTriangle className="h-4 w-4" />,
          trend: 5,
        })}
        {statsCard({
          title: 'Blocked Votes',
          value: stats.blockedVotes,
          icon: <CheckCircle2 className="h-4 w-4" />,
          trend: -3,
        })}
        {statsCard({
          title: 'Recovered Amount',
          value: stats.recoveredAmount,
          icon: <TrendingUp className="h-4 w-4" />,
          format: 'currency',
        })}
        {statsCard({
          title: 'False Positives',
          value: stats.falsePositives,
          icon: <Clock className="h-4 w-4" />,
          format: 'percentage',
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Fraud Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Fraud Detection Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={fraudTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="count" fill="#ef4444" stroke="#dc2626" name="Cases" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Risk Level Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Level Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  { level: 'Low', count: fraudCases.filter((c) => c.riskLevel === 'low').length },
                  { level: 'Medium', count: fraudCases.filter((c) => c.riskLevel === 'medium').length },
                  { level: 'High', count: fraudCases.filter((c) => c.riskLevel === 'high').length },
                  { level: 'Critical', count: fraudCases.filter((c) => c.riskLevel === 'critical').length },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="level" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Fraud Patterns */}
      <Card>
        <CardHeader>
          <CardTitle>Detected Fraud Patterns</CardTitle>
        </CardHeader>
        <CardContent>
          <VirtualTable<FraudPattern>
            columns={patternColumns}
            data={fraudPatterns}
            isLoading={isLoading}
            emptyMessage="No fraud patterns detected"
            searchableColumns={['name']}
          />
        </CardContent>
      </Card>

      {/* Recent Fraud Cases */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Fraud Cases</CardTitle>
        </CardHeader>
        <CardContent>
          <VirtualTable<FraudCase>
            columns={caseColumns}
            data={fraudCases}
            isLoading={isLoading}
            emptyMessage="No fraud cases"
            searchableColumns={['userId', 'voteId']}
            onRowClick={(row) => setSelectedCase(row)}
          />
        </CardContent>
      </Card>

      {/* Case Details Modal */}
      {selectedCase && (
        <Card>
          <CardHeader>
            <CardTitle>Case Details: {selectedCase.id}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Risk Score</Label>
                <div className="text-2xl font-bold">{selectedCase.riskScore.toFixed(1)}%</div>
              </div>
              <div>
                <Label className="text-sm font-medium">Risk Level</Label>
                <Badge className={cn('text-white mt-1', riskLevelColors[selectedCase.riskLevel])}>
                  {riskLevelLabels[selectedCase.riskLevel]}
                </Badge>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Reason</Label>
              <p className="text-sm text-muted-foreground mt-1">{selectedCase.reason}</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => onReviewCase?.(selectedCase.id)}>Review</Button>
              <Button variant="outline" onClick={() => setSelectedCase(null)}>Close</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={cn('text-sm font-medium text-muted-foreground', className)}>{children}</label>;
}
