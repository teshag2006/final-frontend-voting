'use client';

import { mockRevenueData } from '@/lib/dashboard-mock';
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
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#2563eb', '#f59e0b', '#64748b'];

export default function RevenuePage() {
  const { metrics, snapshots, payment_methods } = mockRevenueData;
  const pieData = [
    { name: 'Stripe', value: payment_methods.stripe_percentage },
    { name: 'PayPal', value: payment_methods.paypal_percentage },
    { name: 'Other', value: payment_methods.other_percentage },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-slate-800">Revenue</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Metric title="Total Revenue" value={`$${(metrics.total_revenue / 100).toLocaleString()}`} />
        <Metric title="This Week" value={`$${(metrics.revenue_this_week / 100).toLocaleString()}`} />
        <Metric title="This Month" value={`$${(metrics.revenue_this_month / 100).toLocaleString()}`} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-slate-800">Revenue Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={snapshots}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: 12 }} />
              <YAxis stroke="#64748b" style={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => `$${(Number(value) / 100).toFixed(2)}`} />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-slate-800">Payment Methods</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={90} label>
                {pieData.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}%`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-2 text-4xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}
