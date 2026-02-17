'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { TopContestant } from '@/types/media';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface TopContestantsChartProps {
  data: TopContestant[];
}

export function TopContestantsChart({ data }: TopContestantsChartProps) {
  const chartData = data.slice(0, 10).map((contestant) => ({
    name: contestant.name.split(' ')[0],
    votes: contestant.totalVotes,
    revenue: contestant.revenue,
  }));

  return (
    <Card className="border-0 bg-slate-950 p-6 shadow-lg">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white">Top 10 Contestants</h3>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-sm text-slate-400">1h</span>
          <span className="text-sm text-slate-400">•</span>
          <span className="text-sm text-slate-400">24h</span>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {data.slice(0, 3).map((contestant) => {
          const getTrendIcon = () => {
            if (contestant.trend === 'up') return <ArrowUp className="h-4 w-4" />;
            if (contestant.trend === 'down') return <ArrowDown className="h-4 w-4" />;
            return <Minus className="h-4 w-4" />;
          };

          const getTrendColor = () => {
            if (contestant.trend === 'up') return 'text-green-400';
            if (contestant.trend === 'down') return 'text-red-400';
            return 'text-slate-400';
          };

          return (
            <div key={contestant.rank} className="flex items-center gap-3 rounded-lg bg-slate-900 p-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={contestant.avatar} alt={contestant.name} />
                <AvatarFallback className="bg-slate-800 text-white">
                  {contestant.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{contestant.name}</span>
                  <Badge variant="secondary" className="bg-slate-800 text-xs">
                    #{contestant.rank}
                  </Badge>
                </div>
                <p className="text-sm text-slate-400">${contestant.revenue.toLocaleString()}</p>
              </div>
              <div className={`flex items-center gap-1 ${getTrendColor()}`}>
                {getTrendIcon()}
              </div>
            </div>
          );
        })}
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: '12px' }} />
            <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#f1f5f9',
              }}
            />
            <Legend
              wrapperStyle={{ color: '#cbd5e1' }}
              iconType="square"
              style={{ fontSize: '12px' }}
            />
            <Bar dataKey="votes" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
