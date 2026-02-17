import type { Metadata } from 'next';
import { getAnalyticsData } from '@/lib/api';
import { mockAnalyticsData } from '@/lib/dashboard-mock';
import { StatsCard } from '@/components/dashboard/stats-card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { AlertCircle, CheckCircle, Trash2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Vote Analytics | Contestant Portal',
  description: 'Detailed voting analytics and insights',
};

export default async function AnalyticsPage() {
  const apiData = await getAnalyticsData();
  const data = apiData || mockAnalyticsData;

  const { daily_votes, hourly_distribution, fraud_metrics } = data;

  return (
    <div className="p-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Vote Analytics</h1>
        <p className="text-muted-foreground">Detailed analysis of your voting patterns.</p>
      </div>

      {/* Daily Votes Chart */}
      <div className="bg-white rounded-lg border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Daily Votes</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={daily_votes}>
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

      {/* Vote Distribution by Hour */}
      <div className="bg-white rounded-lg border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Vote Distribution by Hour</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={hourly_distribution}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="hour"
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '12px' }}
              label={{ value: 'Hour (24h format)', position: 'insideBottomRight', offset: -5 }}
            />
            <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              formatter={(value) => [`${value} votes`, 'Count']}
            />
            <Bar
              dataKey="votes"
              fill="hsl(var(--chart-1))"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Fraud Detection Summary */}
      <div className="bg-white rounded-lg border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-6">Fraud Detection</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="Total Votes"
            value={fraud_metrics.total_votes}
            subtext="Analyzed votes"
          />
          <StatsCard
            title="Suspicious Votes"
            value={fraud_metrics.suspicious_votes}
            icon={<AlertCircle className="w-6 h-6 text-yellow-600" />}
            subtext={`${((fraud_metrics.suspicious_votes / fraud_metrics.total_votes) * 100).toFixed(2)}% of total`}
          />
          <StatsCard
            title="Confirmed Fraud"
            value={fraud_metrics.confirmed_fraud}
            icon={<AlertCircle className="w-6 h-6 text-red-600" />}
            subtext="Removed votes"
          />
        </div>

        {/* Fraud Action Items */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-900">
                {fraud_metrics.flagged_votes} votes flagged for review
              </span>
            </div>
            <span className="text-xs font-medium text-yellow-600">Pending</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-3">
              <Trash2 className="w-5 h-5 text-red-600" />
              <span className="text-sm font-medium text-red-900">
                {fraud_metrics.removed_votes} votes removed
              </span>
            </div>
            <span className="text-xs font-medium text-red-600">Removed</span>
          </div>
        </div>
      </div>

      {/* Security Notes */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-green-900 mb-1">Security & Verification</h3>
            <p className="text-sm text-green-800">
              All votes shown have passed our blockchain verification and fraud detection systems. We use
              advanced ML models and manual review to ensure contest integrity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
