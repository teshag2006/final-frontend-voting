'use client';

import { mockDashboardOverview } from '@/lib/dashboard-mock';
import { StatsCard } from '@/components/dashboard/stats-card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DollarSign, TrendingUp, Gift, CheckCircle } from 'lucide-react';

export default function DashboardPage() {
  const data = mockDashboardOverview;

  const { metrics, vote_snapshots, top_countries, integrity_status } = data;

  return (
    <div className="p-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome back! Here's your voting performance summary.</p>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Votes"
          value={metrics.total_votes}
          icon={<TrendingUp className="w-6 h-6" />}
          trend={{
            value: metrics.revenue_trend,
            direction: metrics.revenue_trend > 0 ? 'up' : 'down',
          }}
          subtext="All time"
        />
        <StatsCard
          title="Free Votes"
          value={metrics.free_votes}
          icon={<Gift className="w-6 h-6" />}
          subtext={`${((metrics.free_votes / metrics.total_votes) * 100).toFixed(1)}% of total`}
        />
        <StatsCard
          title="Paid Votes"
          value={metrics.paid_votes}
          icon={<DollarSign className="w-6 h-6" />}
          subtext={`${((metrics.paid_votes / metrics.total_votes) * 100).toFixed(1)}% of total`}
        />
        <StatsCard
          title="Revenue Generated"
          value={`$${(metrics.revenue_generated / 100).toFixed(2)}`}
          icon={<DollarSign className="w-6 h-6 text-green-600" />}
          trend={{
            value: metrics.revenue_trend,
            direction: metrics.revenue_trend > 0 ? 'up' : 'down',
          }}
          subtext="Total earned"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Votes Over Time */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Votes Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={vote_snapshots}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: '12px' }}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="free_votes"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                dot={false}
                name="Free Votes"
              />
              <Line
                type="monotone"
                dataKey="paid_votes"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                dot={false}
                name="Paid Votes"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Voting Countries */}
        <div className="bg-white rounded-lg border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Top Voting Countries</h2>
          <div className="space-y-4">
            {top_countries.map((country) => (
              <div key={country.country_code}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground flex items-center gap-2">
                    <span className="text-lg">{getCountryFlag(country.country_code)}</span>
                    {country.country}
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {country.votes.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-accent rounded-full h-2 transition-all"
                    style={{
                      width: `${(country.votes / Math.max(...top_countries.map((c) => c.votes))) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Integrity Status */}
      <div className="bg-white rounded-lg border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-6">Integrity Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                integrity_status.blockchain_verified
                  ? 'bg-green-100'
                  : 'bg-red-100'
              }`}
            >
              <CheckCircle
                className={`w-6 h-6 ${
                  integrity_status.blockchain_verified
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Blockchain Verified
              </p>
              <p className="text-xs text-muted-foreground">
                {integrity_status.blockchain_verified ? 'Verified' : 'Pending'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                !integrity_status.fraud_detected
                  ? 'bg-green-100'
                  : 'bg-yellow-100'
              }`}
            >
              <CheckCircle
                className={`w-6 h-6 ${
                  !integrity_status.fraud_detected
                    ? 'text-green-600'
                    : 'text-yellow-600'
                }`}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Fraud Detection
              </p>
              <p className="text-xs text-muted-foreground">
                {!integrity_status.fraud_detected ? 'No fraud detected' : 'Under review'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                !integrity_status.under_review
                  ? 'bg-green-100'
                  : 'bg-yellow-100'
              }`}
            >
              <CheckCircle
                className={`w-6 h-6 ${
                  !integrity_status.under_review
                    ? 'text-green-600'
                    : 'text-yellow-600'
                }`}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Review Status
              </p>
              <p className="text-xs text-muted-foreground">
                {!integrity_status.under_review ? 'Clear' : 'Under review'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getCountryFlag(countryCode: string): string {
  const flags: Record<string, string> = {
    ET: '🇪🇹',
    KE: '🇰🇪',
    US: '🇺🇸',
    NG: '🇳🇬',
    ZA: '🇿🇦',
    GH: '🇬🇭',
    EG: '🇪🇬',
  };
  return flags[countryCode] || '🌍';
}

