'use client';

import { useEffect, useState } from 'react';
import { mockAnalyticsData } from '@/lib/dashboard-mock';
import { CampaignAttributionChart } from '@/components/dashboard/campaign-attribution-chart';
import { DeliverablePerformanceTable } from '@/components/dashboard/deliverable-performance-table';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { ContestantAttributionItem } from '@/lib/contestant-runtime-store';

export default function AnalyticsPage() {
  const { daily_votes, hourly_distribution, fraud_metrics } = mockAnalyticsData;
  const [attribution, setAttribution] = useState<ContestantAttributionItem[]>([]);

  useEffect(() => {
    fetch('/api/contestant/sponsors/attribution')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setAttribution((data as ContestantAttributionItem[]) || []))
      .catch(() => setAttribution([]));
  }, []);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-slate-800">Vote Analytics</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-slate-800">Daily Votes</h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={daily_votes}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: 12 }} />
              <YAxis stroke="#64748b" style={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="free_votes" stroke="#2563eb" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="paid_votes" stroke="#ef4444" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-slate-800">Vote Distribution by Hour</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={hourly_distribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="hour" stroke="#64748b" style={{ fontSize: 12 }} />
              <YAxis stroke="#64748b" style={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="votes" fill="#f59e0b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">Fraud Detection</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <InfoTile label="Total Votes" value={fraud_metrics.total_votes.toLocaleString()} />
          <InfoTile label="Suspicious Votes" value={fraud_metrics.suspicious_votes.toLocaleString()} accent="text-red-600" />
          <InfoTile label="Confirmed Fraud" value={fraud_metrics.confirmed_fraud.toLocaleString()} />
          <InfoTile label="Flagged" value={fraud_metrics.flagged_votes.toLocaleString()} />
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <CampaignAttributionChart data={attribution} />
        <DeliverablePerformanceTable data={attribution} />
      </div>
    </div>
  );
}

function InfoTile({ label, value, accent = 'text-slate-900' }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${accent}`}>{value}</p>
    </div>
  );
}
