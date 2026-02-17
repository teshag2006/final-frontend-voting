'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { VoteTrend } from '@/types/media';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

interface VoteTrendChartProps {
  data: VoteTrend[];
}

export function VoteTrendChart({ data }: VoteTrendChartProps) {
  const [timeRange, setTimeRange] = useState('24h');

  return (
    <Card className="border-0 bg-slate-950 p-6 shadow-lg">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Votes Over Time</h3>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32 border-slate-700 bg-slate-900 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-slate-700 bg-slate-900">
            <SelectItem value="24h">Last 24h</SelectItem>
            <SelectItem value="7d">Last 7d</SelectItem>
            <SelectItem value="30d">Last 30d</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorVotes" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis dataKey="timestamp" stroke="#94a3b8" style={{ fontSize: '12px' }} />
          <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#f1f5f9',
            }}
          />
          <Area
            type="monotone"
            dataKey="totalVotes"
            stroke="#3b82f6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorVotes)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
