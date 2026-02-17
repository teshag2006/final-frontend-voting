'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { VoteActivityData } from '@/types/admin-overview';

interface VoteActivityChartProps {
  data24h: VoteActivityData;
  data7d: VoteActivityData;
  onRangeChange?: (range: '24h' | '7d') => void;
}

function formatChartData(data: VoteActivityData) {
  return data.data.map((point) => ({
    ...point,
    time:
      data.range === '24h'
        ? new Date(point.timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          })
        : new Date(point.timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
  }));
}

export function VoteActivityChart({
  data24h,
  data7d,
  onRangeChange,
}: VoteActivityChartProps) {
  const [range, setRange] = useState<'24h' | '7d'>('24h');

  const handleRangeChange = (newRange: '24h' | '7d') => {
    setRange(newRange);
    onRangeChange?.(newRange);
  };

  const currentData = range === '24h' ? data24h : data7d;
  const chartData = formatChartData(currentData);

  const totalValid = currentData.data.reduce((sum, p) => sum + p.validVotes, 0);
  const totalPending = currentData.data.reduce((sum, p) => sum + p.pendingVotes, 0);
  const totalFraud = currentData.data.reduce((sum, p) => sum + p.fraudFlaggedVotes, 0);

  return (
    <Card className="p-6 lg:col-span-2">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Voting Activity</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time vote submission tracking
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={range === '24h' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleRangeChange('24h')}
            className="text-xs"
          >
            24h
          </Button>
          <Button
            variant={range === '7d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleRangeChange('7d')}
            className="text-xs"
          >
            7d
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
          <p className="text-xs text-muted-foreground font-medium">Valid Votes</p>
          <p className="text-lg font-bold text-green-600 dark:text-green-400 mt-1">
            {totalValid.toLocaleString()}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
          <p className="text-xs text-muted-foreground font-medium">Pending</p>
          <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-1">
            {totalPending.toLocaleString()}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20">
          <p className="text-xs text-muted-foreground font-medium">Flagged</p>
          <p className="text-lg font-bold text-red-600 dark:text-red-400 mt-1">
            {totalFraud.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80 -mx-6 px-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="time"
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
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="validVotes"
              stroke="#22c55e"
              name="Valid"
              dot={false}
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="pendingVotes"
              stroke="#3b82f6"
              name="Pending"
              dot={false}
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="fraudFlaggedVotes"
              stroke="#ef4444"
              name="Flagged"
              dot={false}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
