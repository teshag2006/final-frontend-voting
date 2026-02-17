'use client';

import { AlertTriangle, Zap, Shield } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { DeviceRiskOverview } from '@/types/admin-overview';

interface DeviceRiskPanelProps {
  overview: DeviceRiskOverview;
}

export function DeviceRiskPanel({ overview }: DeviceRiskPanelProps) {
  const riskChartData = overview.riskDistribution.map((item) => ({
    name: item.riskLevel.charAt(0).toUpperCase() + item.riskLevel.slice(1),
    count: item.count,
    percentage: (item.percentage * 100).toFixed(1),
  }));

  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high':
        return '#dc2626';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Device Risk Assessment</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Trust score distribution and bot detection
          </p>
        </div>
        <Shield className="h-5 w-5 text-blue-500" />
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <p className="text-xs text-muted-foreground font-medium">High Risk</p>
          </div>
          <p className="text-2xl font-bold text-foreground">{overview.highRiskDevices}</p>
          <p className="text-xs text-muted-foreground mt-1">devices flagged</p>
        </div>

        <div className="p-4 rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-orange-500" />
            <p className="text-xs text-muted-foreground font-medium">Bot Detected</p>
          </div>
          <p className="text-2xl font-bold text-foreground">{overview.botFlaggedDevices}</p>
          <p className="text-xs text-muted-foreground mt-1">suspicious patterns</p>
        </div>

        <div className="p-4 rounded-lg border border-border bg-blue-50 dark:bg-blue-950/20">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-blue-500" />
            <p className="text-xs text-muted-foreground font-medium">Avg Trust</p>
          </div>
          <p className="text-2xl font-bold text-blue-600">{overview.averageTrustScore}</p>
          <p className="text-xs text-muted-foreground mt-1">out of 100</p>
        </div>
      </div>

      {/* Risk Distribution Chart */}
      <div className="mt-6">
        <h4 className="text-sm font-semibold text-foreground mb-4">Risk Level Distribution</h4>
        <div className="h-64 -mx-6 px-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={riskChartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="name"
                stroke="currentColor"
                style={{ fontSize: '0.75rem' }}
                tick={{ fill: 'var(--muted-foreground)' }}
              />
              <YAxis
                stroke="currentColor"
                style={{ fontSize: '0.75rem' }}
                tick={{ fill: 'var(--muted-foreground)' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
                formatter={(value, name) => {
                  if (name === 'count') return [value, 'Devices'];
                  return value;
                }}
              />
              <Bar
                dataKey="count"
                fill="#3b82f6"
                radius={[8, 8, 0, 0]}
                name="Device Count"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Risk Level Labels */}
      <div className="mt-6 grid grid-cols-3 gap-4 pt-6 border-t border-border">
        {overview.riskDistribution.map((item) => (
          <div key={item.riskLevel} className="text-center">
            <div
              className="w-3 h-3 rounded-full mx-auto mb-2"
              style={{ backgroundColor: getRiskColor(item.riskLevel) }}
            ></div>
            <p className="text-xs font-medium text-foreground">
              {item.riskLevel.charAt(0).toUpperCase() + item.riskLevel.slice(1)}
            </p>
            <p className="text-sm font-bold text-foreground mt-1">{item.count}</p>
            <p className="text-xs text-muted-foreground">{(item.percentage * 100).toFixed(1)}%</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
