import type { Metadata } from 'next';
import { getRevenueData } from '@/lib/api';
import { mockRevenueData } from '@/lib/dashboard-mock';
import { StatsCard } from '@/components/dashboard/stats-card';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { DollarSign, TrendingUp } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Revenue | Contestant Portal',
  description: 'Track your revenue and payment analytics',
};

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'];

export default async function RevenuePage() {
  const apiData = await getRevenueData();
  const data = apiData || mockRevenueData;

  const { metrics, snapshots, payment_methods } = data;

  const paymentData = [
    { name: 'Stripe', value: payment_methods.stripe_percentage },
    { name: 'PayPal', value: payment_methods.paypal_percentage },
    { name: 'Other', value: payment_methods.other_percentage },
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Revenue Analytics</h1>
        <p className="text-muted-foreground">Track your earnings from paid votes.</p>
      </div>

      {/* Revenue Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Revenue"
          value={`$${(metrics.total_revenue / 100).toFixed(2)}`}
          icon={<DollarSign className="w-6 h-6 text-green-600" />}
        />
        <StatsCard
          title="This Week"
          value={`$${(metrics.revenue_this_week / 100).toFixed(2)}`}
          icon={<TrendingUp className="w-6 h-6" />}
          subtext="7 days"
        />
        <StatsCard
          title="This Month"
          value={`$${(metrics.revenue_this_month / 100).toFixed(2)}`}
          icon={<DollarSign className="w-6 h-6" />}
          subtext="30 days"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Over Time */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Revenue Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={snapshots}>
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
                formatter={(value) => `$${(value as number / 100).toFixed(2)}`}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-lg border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Payment Methods</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={paymentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {paymentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}%`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">Revenue Information</h3>
        <p className="text-sm text-blue-800 mb-3">
          Revenue is calculated from verified paid votes. We support multiple payment methods for maximum
          convenience.
        </p>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Payments are processed within 24-48 hours</li>
          <li>• Disputed or fraudulent payments are reversed</li>
          <li>• Full transparency reports available upon request</li>
        </ul>
      </div>
    </div>
  );
}
