'use client';

import { MediaDashboardHeader } from '@/components/media/dashboard-header';
import { MediaDashboardNav } from '@/components/media/dashboard-nav';
import { FraudSummary } from '@/components/media/fraud-summary';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { AlertTriangle } from 'lucide-react';
import { mockFraudSummary } from '@/lib/media-mock';

const fraudTrendData = [
  { day: 'Mon', incidents: 12, resolved: 10 },
  { day: 'Tue', incidents: 15, resolved: 12 },
  { day: 'Wed', incidents: 8, resolved: 8 },
  { day: 'Thu', incidents: 14, resolved: 11 },
  { day: 'Fri', incidents: 18, resolved: 14 },
  { day: 'Sat', incidents: 11, resolved: 11 },
  { day: 'Sun', incidents: 9, resolved: 9 },
];

const fraudTypeData = [
  { type: 'Velocity Abuse', count: 45, percentage: 28.8 },
  { type: 'Device Fraud', count: 38, percentage: 24.4 },
  { type: 'Geographic Anomaly', count: 32, percentage: 20.5 },
  { type: 'VPN Detection', count: 28, percentage: 17.9 },
  { type: 'Duplicate Account', count: 13, percentage: 8.3 },
];

export default function MediaFraudPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <MediaDashboardHeader />
      <MediaDashboardNav />

      <main className="space-y-6 px-4 py-8 md:px-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">Fraud Transparency Center</h1>
          <p className="text-sm text-slate-400">Aggregated fraud detection statistics (no individual voter data exposed)</p>
        </div>

        {/* Fraud Summary Cards */}
        <section>
          <FraudSummary data={mockFraudSummary} />
        </section>

        {/* Trends */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Fraud Trend */}
          <Card className="border-0 bg-slate-950 p-6 shadow-lg">
            <h3 className="mb-6 text-lg font-semibold text-white">Fraud Trend (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={fraudTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="day" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#f1f5f9',
                  }}
                />
                <Line type="monotone" dataKey="incidents" stroke="#ef4444" strokeWidth={2} name="Incidents" />
                <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} name="Resolved" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Fraud Type Distribution */}
          <Card className="border-0 bg-slate-950 p-6 shadow-lg">
            <h3 className="mb-6 text-lg font-semibold text-white">Fraud Type Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={fraudTypeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="type" stroke="#94a3b8" style={{ fontSize: '12px' }} angle={-45} textAnchor="end" height={100} />
                <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#f1f5f9',
                  }}
                />
                <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Fraud Type Details */}
        <Card className="border-0 bg-slate-950 p-6 shadow-lg">
          <h3 className="mb-6 text-lg font-semibold text-white">Fraud Detection Methods</h3>

          <div className="space-y-3">
            {fraudTypeData.map((item) => (
              <div key={item.type} className="flex items-center justify-between rounded-lg bg-slate-900 p-3">
                <div className="flex-1">
                  <p className="font-medium text-white text-sm">{item.type}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-1 flex-1 rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-red-500"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400">{item.percentage.toFixed(1)}%</span>
                  </div>
                </div>
                <Badge variant="secondary" className="ml-4 bg-red-500/20 text-red-400">
                  {item.count}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Information Banner */}
        <div className="flex items-start gap-3 rounded-lg border border-amber-700/50 bg-amber-500/10 p-4">
          <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-300">
            <p className="font-medium">Privacy & Transparency</p>
            <p className="mt-1 text-xs text-amber-200">
              This dashboard shows aggregated fraud detection statistics only. No individual voter information, IP addresses,
              device fingerprints, or trust scores are exposed. All data is anonymized and suitable for public reporting.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

