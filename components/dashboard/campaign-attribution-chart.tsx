'use client';

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ContestantAttributionItem } from '@/lib/contestant-runtime-store';

export function CampaignAttributionChart({ data }: { data: ContestantAttributionItem[] }) {
  return (
    <div className="h-72 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-2 text-lg font-semibold text-slate-800">Campaign Attribution Trend</h3>
      <ResponsiveContainer width="100%" height="88%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="label" stroke="#64748b" style={{ fontSize: 12 }} />
          <YAxis stroke="#64748b" style={{ fontSize: 12 }} />
          <Tooltip />
          <Line type="monotone" dataKey="impressions" stroke="#1d4ed8" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="clicks" stroke="#059669" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="conversions" stroke="#ca8a04" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
