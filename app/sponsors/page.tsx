'use client';

import Link from 'next/link';
import { type ReactNode, useCallback, useEffect, useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  BadgeCheck,
  CheckCircle2,
  CircleDollarSign,
  Info,
  LineChart,
  RefreshCw,
  Shield,
  Sparkles,
  Wallet,
} from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getSponsorCampaignTracking, getSponsorDashboardOverview } from '@/lib/api';
import {
  mockSponsorCampaignTracking,
  mockSponsorDashboardOverview,
  type SponsorCampaignTracking,
  type SponsorDashboardOverview,
} from '@/lib/sponsorship-mock';

export default function SponsorsOverviewPage() {
  const [overview, setOverview] = useState<SponsorDashboardOverview>(mockSponsorDashboardOverview);
  const [campaigns, setCampaigns] = useState<SponsorCampaignTracking[]>(mockSponsorCampaignTracking);
  const [isLoading, setIsLoading] = useState(true);
  const [loadMessage, setLoadMessage] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setLoadMessage(null);

    const [overviewRes, campaignsRes] = await Promise.all([getSponsorDashboardOverview(), getSponsorCampaignTracking()]);
    const hasOverview = Boolean(overviewRes);
    const hasCampaigns = Boolean(campaignsRes);

    if (overviewRes) setOverview(overviewRes);
    if (campaignsRes) setCampaigns(campaignsRes);

    if (!hasOverview && !hasCampaigns) {
      setLoadMessage('Could not reach sponsor API. Showing mock data.');
    } else if (!hasOverview || !hasCampaigns) {
      setLoadMessage('Partially updated from API. Remaining values are from mock data.');
    }

    setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const pendingVerification = overview.verificationStatus === 'pending';
  const recentCampaigns = campaigns.slice(0, 3);
  const series = buildPerformanceSeries(overview.campaignPerformanceSummary);
  const paidCount = campaigns.filter((item) => item.paymentStatus === 'paid').length;
  const pendingPaymentCount = campaigns.filter((item) => item.paymentStatus === 'pending_manual').length;

  return (
    <div className="min-h-screen bg-slate-100/80">
      <main className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <section>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Sponsor Dashboard</h1>
              <p className="mt-1 text-sm text-slate-600">
                Manage and track all your sponsorship campaigns from one dashboard.
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Last updated: {lastUpdated || 'Not synced yet'}
              </p>
            </div>
            <Button type="button" variant="outline" onClick={loadDashboard} disabled={isLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </section>

        {isLoading && (
          <section className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
            Syncing latest sponsor metrics...
          </section>
        )}

        {loadMessage && (
          <section className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {loadMessage}
          </section>
        )}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <KpiCard
            label="Trust Score"
            value={`${overview.trustScore}`}
            helper="+2 in 7 days"
            tone="success"
            icon={<Shield className="h-4 w-4" />}
          />
          <KpiCard
            label="Verification"
            value={pendingVerification ? 'Pending' : 'Verified'}
            helper={pendingVerification ? 'Verification pending state' : 'Verified Sponsor'}
            tone={pendingVerification ? 'warning' : 'success'}
            icon={pendingVerification ? <Sparkles className="h-4 w-4" /> : <BadgeCheck className="h-4 w-4" />}
          />
          <KpiCard
            label="Active Campaigns"
            value={overview.activeCampaigns.toString()}
            helper={`${paidCount} paid active`}
            tone="info"
            icon={<LineChart className="h-4 w-4" />}
          />
          <KpiCard
            label="Pending Payments"
            value={overview.pendingPayments.toString()}
            helper={
              pendingPaymentCount > 0
                ? `${pendingPaymentCount} awaiting manual confirmation`
                : 'All campaign payments settled'
            }
            tone={overview.pendingPayments > 0 ? 'warning' : 'success'}
            icon={<Wallet className="h-4 w-4" />}
          />
          <KpiCard
            label="Summary CTR"
            value={`${overview.campaignPerformanceSummary.ctr.toFixed(2)}%`}
            helper={overview.campaignPerformanceSummary.ctr >= 3 ? 'Up from 30-day avg' : 'Below 30-day avg'}
            tone={overview.campaignPerformanceSummary.ctr >= 3 ? 'success' : 'neutral'}
            icon={<CircleDollarSign className="h-4 w-4" />}
          />
        </section>

        <section className="rounded-2xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-sm text-blue-900">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-700" />
              Sponsorship metrics do not influence voting leaderboard results.
            </p>
            <Button asChild variant="outline" className="border-blue-200 bg-white text-blue-900 hover:bg-blue-100">
              <Link href="/sponsors/settings">Compliance Policy</Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.7fr_1fr]">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Campaign Performance</h2>
                <p className="text-sm text-slate-600">7-day performance snapshot</p>
              </div>
              <div className="flex gap-2">
                {pendingVerification ? (
                  <Badge className="bg-amber-100 text-amber-800">Pending Verification</Badge>
                ) : (
                  <Badge className="bg-emerald-100 text-emerald-800">Verified Sponsor</Badge>
                )}
                <Badge className="bg-blue-100 text-blue-800">Cached SDS & TS</Badge>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Metric label="Impressions" value={overview.campaignPerformanceSummary.impressions.toLocaleString()} />
              <Metric label="Clicks" value={overview.campaignPerformanceSummary.clicks.toLocaleString()} />
              <Metric label="CTR" value={`${overview.campaignPerformanceSummary.ctr.toFixed(2)}%`} />
              <Metric label="Conversions" value={overview.campaignPerformanceSummary.conversions.toLocaleString()} />
            </div>

            <div className="mt-4 h-64 rounded-xl border border-slate-100 bg-slate-50 p-2">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={series}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="impressions" stroke="#1d4ed8" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="clicks" stroke="#059669" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="conversions" stroke="#ca8a04" strokeWidth={2} dot={false} />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </article>

          <aside className="space-y-4">
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-lg font-semibold text-slate-900">Compliance</p>
              <p className="mt-2 text-sm text-slate-600">
                Sponsorship badges and metrics do not affect voting leaderboard results.
              </p>
              <Link href="/sponsors/settings" className="mt-3 inline-flex items-center text-sm font-medium text-blue-700">
                Learn More
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </Link>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-lg font-semibold text-slate-900">Payment Ops</p>
              <div className="mt-3 space-y-2 text-sm text-slate-700">
                <p className="flex items-center justify-between">
                  Manual queue
                  <span className="font-semibold text-slate-900">{pendingPaymentCount}</span>
                </p>
                <p className="flex items-center justify-between">
                  Paid campaigns
                  <span className="font-semibold text-slate-900">{paidCount}</span>
                </p>
                <p className="flex items-center justify-between">
                  Verification
                  <span className="font-semibold text-slate-900">{pendingVerification ? 'Pending' : 'Verified'}</span>
                </p>
              </div>
            </article>
          </aside>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-slate-900">Workspace</h2>
            <Button asChild variant="outline">
              <Link href="/sponsors/campaigns">View All</Link>
            </Button>
          </div>

          {recentCampaigns.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-[0.08em] text-slate-500">
                    <th className="px-2 py-3 font-medium">Contestant</th>
                    <th className="px-2 py-3 font-medium">Campaign</th>
                    <th className="px-2 py-3 font-medium">Status</th>
                    <th className="px-2 py-3 font-medium">Payment</th>
                    <th className="px-2 py-3 font-medium">Admin Note</th>
                    <th className="px-2 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCampaigns.map((campaign) => (
                    <tr key={campaign.id} className="border-b border-slate-100">
                      <td className="px-2 py-3">
                        <div className="flex items-center gap-3">
                          <AvatarBadge name={campaign.contestantSlug} />
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{toTitle(campaign.contestantSlug)}</p>
                            <p className="text-xs text-slate-500">{campaign.contestantSlug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-3">
                        <p className="text-sm font-medium text-slate-900">{campaign.sponsorName}</p>
                        <p className="text-xs text-slate-500">Campaign #{campaign.id}</p>
                      </td>
                      <td className="px-2 py-3">
                        <CampaignStatusBadge status={campaign.campaignStatus} />
                      </td>
                      <td className="px-2 py-3">
                        <PaymentStatusBadge status={campaign.paymentStatus} />
                      </td>
                      <td className="px-2 py-3">
                        <p className="line-clamp-2 text-sm text-slate-700">{campaign.adminNotes}</p>
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex flex-wrap gap-2">
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/sponsors/${campaign.contestantSlug}`}>Contestant</Link>
                          </Button>
                          <Button asChild size="sm">
                            <Link href={`/sponsors/campaigns?contestant=${campaign.contestantSlug}`}>Campaign</Link>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <article className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              No campaigns yet. Start by discovering contestants and submitting your first request.
            </article>
          )}
        </section>

        <section className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <p className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Sponsorship badges and campaign metrics are isolated from voting rank logic.
          </p>
        </section>
      </main>
    </div>
  );
}

function KpiCard({
  label,
  value,
  helper,
  icon,
  tone = 'neutral',
}: {
  label: string;
  value: string;
  helper?: string;
  icon: ReactNode;
  tone?: 'success' | 'warning' | 'info' | 'neutral';
}) {
  const iconTone =
    tone === 'success'
      ? 'bg-emerald-100 text-emerald-700'
      : tone === 'warning'
        ? 'bg-amber-100 text-amber-700'
        : tone === 'info'
          ? 'bg-blue-100 text-blue-700'
          : 'bg-slate-100 text-slate-700';
  const trendUp = tone === 'success' || tone === 'info';

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <span className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${iconTone}`}>{icon}</span>
      <p className="mt-3 text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-semibold leading-tight text-slate-900">{value}</p>
      {helper ? (
        <p className="mt-2 inline-flex items-center gap-1 text-xs text-slate-600">
          {trendUp ? <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600" /> : <ArrowDownRight className="h-3.5 w-3.5 text-amber-600" />}
          {helper}
        </p>
      ) : null}
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-base font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function CampaignStatusBadge({ status }: { status: SponsorCampaignTracking['campaignStatus'] }) {
  const tone =
    status === 'draft'
      ? 'bg-slate-100 text-slate-700'
      : status === 'active'
      ? 'bg-blue-100 text-blue-800'
      : status === 'completed'
        ? 'bg-emerald-100 text-emerald-800'
        : status === 'pending_payment'
          ? 'bg-amber-100 text-amber-800'
          : 'bg-red-100 text-red-800';

  return <Badge className={tone}>{status.replace('_', ' ')}</Badge>;
}

function PaymentStatusBadge({ status }: { status: SponsorCampaignTracking['paymentStatus'] }) {
  const tone =
    status === 'paid'
      ? 'bg-emerald-100 text-emerald-800'
      : status === 'pending_manual'
        ? 'bg-amber-100 text-amber-800'
        : 'bg-red-100 text-red-800';

  return <Badge className={tone}>{status === 'pending_manual' ? 'pending manual' : status}</Badge>;
}

function AvatarBadge({ name }: { name: string }) {
  return (
    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold uppercase text-slate-700">
      {toInitials(name)}
    </span>
  );
}

function toInitials(value: string) {
  return value
    .replace(/[-_]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((item) => item[0]?.toUpperCase() || '')
    .join('');
}

function toTitle(value: string) {
  return value
    .replace(/[-_]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((item) => item[0]?.toUpperCase() + item.slice(1))
    .join(' ');
}

function buildPerformanceSeries(summary: SponsorDashboardOverview['campaignPerformanceSummary']) {
  const labels = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];
  const distribution = [0.11, 0.12, 0.13, 0.14, 0.15, 0.16, 0.19];

  return labels.map((label, index) => ({
    label,
    impressions: Math.round(summary.impressions * distribution[index]),
    clicks: Math.round(summary.clicks * distribution[index]),
    conversions: Math.round(summary.conversions * distribution[index]),
  }));
}
