'use client';

import { DollarSign, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { RevenueAnalytics } from '@/types/admin-overview';

interface RevenueAnalyticsProps {
  analytics: RevenueAnalytics;
}

export function RevenueAnalytics({ analytics }: RevenueAnalyticsProps) {
  const providerColors: Record<string, string> = {
    stripe: '#0ea5e9',
    paypal: '#f59e0b',
    crypto: '#a78bfa',
    manual: '#6b7280',
  };

  const providerChartData = analytics.byProvider.map((provider) => ({
    name: provider.provider.charAt(0).toUpperCase() + provider.provider.slice(1),
    amount: provider.amount,
    transactions: provider.transactionCount,
  }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              <p className="text-3xl font-bold text-foreground mt-2">
                {formatCurrency(analytics.totalRevenue)}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                +15% from last period
              </p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20">
              <DollarSign className="h-6 w-6 text-emerald-500" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Avg Transaction</p>
              <p className="text-3xl font-bold text-foreground mt-2">
                {formatCurrency(analytics.averageTransaction)}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                across all providers
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <TrendingUp className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Provider Breakdown */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6">Revenue by Provider</h3>
        
        {/* Provider List */}
        <div className="space-y-3 mb-6">
          {analytics.byProvider.map((provider) => (
            <div key={provider.provider} className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-foreground">
                    {provider.provider.charAt(0).toUpperCase() + provider.provider.slice(1)}
                  </p>
                  <p className="text-sm font-bold text-foreground">
                    {formatCurrency(provider.amount)}
                  </p>
                </div>
                <div className="w-full h-2 rounded-full bg-border overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${provider.percentage}%`,
                      backgroundColor: providerColors[provider.provider],
                    }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {provider.percentage}% • {provider.transactionCount.toLocaleString()} transactions
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bar Chart */}
        <div className="h-64 mt-6 pt-6 border-t border-border -mx-6 px-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={providerChartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
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
                formatter={(value) => formatCurrency(value as number)}
              />
              <Bar dataKey="amount" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Revenue Trend */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6">Revenue Trend (30 Days)</h3>
        <div className="h-64 -mx-6 px-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analytics.trend} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="date"
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
                formatter={(value) => formatCurrency(value as number)}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                dot={false}
                strokeWidth={2}
                name="Daily Revenue"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
