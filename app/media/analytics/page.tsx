'use client';

import { MediaDashboardHeader } from '@/components/media/dashboard-header';
import { MediaDashboardNav } from '@/components/media/dashboard-nav';
import { Card } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const votesOverTimeData = [
  { time: '00:00', votes: 2400 },
  { time: '04:00', votes: 3200 },
  { time: '08:00', votes: 4100 },
  { time: '12:00', votes: 5900 },
  { time: '16:00', votes: 6800 },
  { time: '20:00', votes: 8200 },
  { time: '23:59', votes: 9200 },
];

const categoryDistribution = [
  { name: 'Miss Africa', value: 45, votes: 560000 },
  { name: 'Mr Africa', value: 35, votes: 435000 },
  { name: 'Youth Award', value: 12, votes: 149000 },
  { name: 'Special Award', value: 8, votes: 101000 },
];

const topTrends = [
  { contestant: 'Sarah M', day1: 45000, day2: 50000, day3: 57000 },
  { contestant: 'David K', day1: 42000, day2: 46000, day3: 50700 },
  { contestant: 'Anna T', day1: 38000, day2: 42000, day3: 46800 },
  { contestant: 'Rachel P', day1: 35000, day2: 38000, day3: 41600 },
  { contestant: 'Ahmed L', day1: 32000, day2: 35000, day3: 38930 },
];

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'];

export default function MediaAnalyticsPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <MediaDashboardHeader />
      <MediaDashboardNav />

      <main className="space-y-6 px-4 py-8 md:px-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">Analytics & Insights</h1>
          <p className="text-sm text-slate-400">Detailed voting statistics and trend analysis</p>
        </div>

        {/* Overview Metrics */}
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { label: 'Total Votes', value: '1.2M', change: '+12.5%' },
            { label: 'Votes Today', value: '245K', change: '+8.3%' },
            { label: 'Avg Vote/Hour', value: '10.2K', change: '-2.1%' },
            { label: 'Active Contestants', value: '156', change: '+0.0%' },
          ].map((metric, idx) => (
            <Card key={idx} className="border-0 bg-slate-900 p-4 shadow-lg">
              <p className="text-xs font-medium text-slate-400">{metric.label}</p>
              <p className="mt-2 text-2xl font-bold text-white">{metric.value}</p>
              <p className={`mt-1 text-xs ${metric.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                {metric.change}
              </p>
            </Card>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Votes Over Time */}
          <Card className="border-0 bg-slate-950 p-6 shadow-lg">
            <h3 className="mb-6 text-lg font-semibold text-white">Votes Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={votesOverTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#f1f5f9',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="votes"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Category Distribution */}
          <Card className="border-0 bg-slate-950 p-6 shadow-lg">
            <h3 className="mb-6 text-lg font-semibold text-white">Category Distribution</h3>
            <div className="flex gap-6 justify-center items-center">
              <ResponsiveContainer width="50%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {categoryDistribution.map((cat, idx) => (
                  <div key={cat.name} className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    <span className="text-sm text-slate-300">
                      {cat.name} <span className="text-slate-500">({cat.value}%)</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Top Trends */}
        <Card className="border-0 bg-slate-950 p-6 shadow-lg">
          <h3 className="mb-6 text-lg font-semibold text-white">Top Contestant Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="contestant" stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#f1f5f9',
                }}
              />
              <Legend wrapperStyle={{ color: '#cbd5e1' }} />
              <Bar dataKey="day1" fill="#94a3b8" radius={[4, 4, 0, 0]} name="Day 1" />
              <Bar dataKey="day2" fill="#7c3aed" radius={[4, 4, 0, 0]} name="Day 2" />
              <Bar dataKey="day3" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Day 3" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Detailed Category Breakdown */}
        <Card className="border-0 bg-slate-950 p-6 shadow-lg">
          <h3 className="mb-6 text-lg font-semibold text-white">Category Breakdown</h3>
          <div className="space-y-4">
            {categoryDistribution.map((cat) => (
              <div key={cat.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-white">{cat.name}</span>
                  <span className="text-sm text-slate-400">{cat.votes.toLocaleString()} votes</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                    style={{
                      width: `${(cat.votes / 560000) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
}

