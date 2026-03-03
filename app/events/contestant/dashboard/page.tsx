'use client';

import { useEffect, useState } from 'react';
import { getContestantProfileData, getContestantReadiness, getDashboardOverview } from '@/lib/api';
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
import type { ContestantProfileComposerData, ContestantReadiness } from '@/lib/contestant-types';
import { authService } from '@/lib/services/authService';

export default function DashboardPage() {
  const [overview, setOverview] = useState<any>({
    metrics: {
      total_votes: 0,
      free_votes: 0,
      paid_votes: 0,
      revenue_generated: 0,
    },
    vote_snapshots: [],
    top_countries: [],
    integrity_status: {
      blockchain_verified: false,
      fraud_detected: false,
      under_review: false,
    },
  });
  const [readiness, setReadiness] = useState<ContestantReadiness>({
    score: 0,
    checks: [],
  });
  const [profile, setProfile] = useState<ContestantProfileComposerData | null>(null);

  useEffect(() => {
    const loadOverview = async () => {
      const token = authService.getToken() || undefined;
      const [overviewData, readinessData, profileData] = await Promise.all([
        getDashboardOverview(token),
        getContestantReadiness(token),
        getContestantProfileData(token),
      ]);
      if (overviewData) setOverview(overviewData);
      if (readinessData) setReadiness(readinessData as ContestantReadiness);
      if (profileData) setProfile(profileData as ContestantProfileComposerData);
    };
    void loadOverview();
  }, []);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-slate-800">Dashboard Overview</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Total Votes" value={Number(overview.metrics.total_votes || 0).toLocaleString()} />
        <MetricCard title="Free Votes" value={Number(overview.metrics.free_votes || 0).toLocaleString()} />
        <MetricCard title="Paid Votes" value={Number(overview.metrics.paid_votes || 0).toLocaleString()} />
        <MetricCard title="Revenue Generated" value={`$${(Number(overview.metrics.revenue_generated || 0) / 100).toLocaleString()}`} green />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">Votes Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={overview.vote_snapshots}>
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
              {overview.top_countries.slice(0, 3).map((country: any) => (
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
              <StatusItem active={Boolean(overview.integrity_status.blockchain_verified)} label="Blockchain Verified" />
              <StatusItem active={!Boolean(overview.integrity_status.fraud_detected)} label="No Fraud Detected" />
              <StatusItem active={!Boolean(overview.integrity_status.under_review)} label="No Active Review" />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-base font-semibold text-slate-800">Social Accounts</h3>
            <div className="space-y-2 text-sm">
              <SocialItem
                label="Facebook"
                href={profile?.facebook ? `https://facebook.com/${String(profile.facebook).replace(/^@/, '')}` : ''}
                value={profile?.facebook}
              />
              <SocialItem
                label="Snapchat"
                href={profile?.snapchat ? `https://snapchat.com/add/${String(profile.snapchat).replace(/^@/, '')}` : ''}
                value={profile?.snapchat}
              />
              <SocialItem
                label="X"
                href={profile?.x ? `https://x.com/${String(profile.x).replace(/^@/, '')}` : ''}
                value={profile?.x}
              />
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

function SocialItem({ label, href, value }: { label: string; href: string; value?: string }) {
  if (!value) {
    return (
      <div className="flex items-center justify-between">
        <span className="text-slate-600">{label}</span>
        <span className="text-slate-400">Not set</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-700">{label}</span>
      <a href={href} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">
        {value}
      </a>
    </div>
  );
}


