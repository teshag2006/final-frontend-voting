'use client';

import { useEffect, useState } from 'react';
import { mockDashboardOverview } from '@/lib/dashboard-mock';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { CheckCircle2 } from 'lucide-react';
import { VotingReadinessCard } from '@/components/dashboard/voting-readiness-card';
import type { ContestantReadiness } from '@/lib/contestant-runtime-store';

export default function DashboardPage() {
  const { metrics, vote_snapshots, top_countries, integrity_status } = mockDashboardOverview;
  const [readiness, setReadiness] = useState<ContestantReadiness>({
    score: 0,
    checks: [],
  });

  useEffect(() => {
    fetch('/api/contestant/readiness')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setReadiness(data as ContestantReadiness);
      })
      .catch(() => undefined);
  }, []);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-slate-800">Dashboard Overview</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Total Votes" value={metrics.total_votes.toLocaleString()} />
        <MetricCard title="Free Votes" value={metrics.free_votes.toLocaleString()} />
        <MetricCard title="Paid Votes" value={metrics.paid_votes.toLocaleString()} />
        <MetricCard title="Revenue Generated" value={`$${(metrics.revenue_generated / 100).toLocaleString()}`} green />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">Votes Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={vote_snapshots}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: 12 }} />
              <YAxis stroke="#64748b" style={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="free_votes" stroke="#2563eb" strokeWidth={2} dot={false} name="Free Votes" />
              <Line type="monotone" dataKey="paid_votes" stroke="#ef4444" strokeWidth={2} dot={false} name="Paid Votes" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-4">
          <VotingReadinessCard readiness={readiness} />
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-base font-semibold text-slate-800">Top Voting Countries</h3>
            <div className="space-y-3">
              {top_countries.slice(0, 3).map((country) => (
                <div key={country.country_code} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{country.country}</span>
                  <span className="font-semibold text-slate-900">{country.votes.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-base font-semibold text-slate-800">Integrity Status</h3>
            <div className="space-y-2 text-sm">
              <StatusItem active={integrity_status.blockchain_verified} label="Blockchain Verified" />
              <StatusItem active={!integrity_status.fraud_detected} label="No Fraud Detected" />
              <StatusItem active={!integrity_status.under_review} label="No Active Review" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  green = false,
}: {
  title: string;
  value: string;
  green?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className={`mt-2 text-4xl font-semibold ${green ? 'text-emerald-600' : 'text-slate-900'}`}>{value}</p>
    </div>
  );
}

function StatusItem({ active, label }: { active: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <CheckCircle2 className={`h-4 w-4 ${active ? 'text-emerald-600' : 'text-slate-400'}`} />
      <span className={active ? 'text-slate-800' : 'text-slate-500'}>{label}</span>
    </div>
  );
}
