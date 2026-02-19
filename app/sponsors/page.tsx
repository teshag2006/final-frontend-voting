'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SponsorLogoutButton } from '@/components/sponsors/sponsor-logout-button';
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

  useEffect(() => {
    let mounted = true;

    Promise.all([getSponsorDashboardOverview(), getSponsorCampaignTracking()]).then(([overviewRes, campaignsRes]) => {
      if (!mounted) return;
      if (overviewRes) setOverview(overviewRes);
      if (campaignsRes) setCampaigns(campaignsRes);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const pendingVerification = overview.verificationStatus === 'pending';
  const recentCampaigns = campaigns.slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Sponsorship & Influence Marketplace v3.0</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">Sponsor Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" className="border-slate-300 bg-white text-slate-700 hover:bg-slate-50">
              <Link href="/sponsors/settings">Profile Settings</Link>
            </Button>
            <Button asChild className="bg-slate-900 text-white hover:bg-slate-800">
              <Link href="/sponsors/discover">Discover Contestants</Link>
            </Button>
            <SponsorLogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <KpiCard label="Trust Score" value={`${overview.trustScore}/100`} />
          <KpiCard
            label="Verification"
            value={pendingVerification ? 'Pending' : 'Verified'}
            helper={pendingVerification ? 'Verification pending state' : 'Verified Sponsor'}
          />
          <KpiCard label="Active Campaigns" value={overview.activeCampaigns.toString()} />
          <KpiCard label="Pending Payments" value={overview.pendingPayments.toString()} />
          <KpiCard label="Summary CTR" value={`${overview.campaignPerformanceSummary.ctr.toFixed(2)}%`} />
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">Campaign Performance Summary</h2>
            <div className="flex gap-2">
              <Badge className="bg-blue-100 text-blue-800">Cached SDS & TS</Badge>
              {!pendingVerification && <Badge className="bg-emerald-100 text-emerald-800">Verified Sponsor</Badge>}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Metric label="Impressions" value={overview.campaignPerformanceSummary.impressions.toLocaleString()} />
            <Metric label="Clicks" value={overview.campaignPerformanceSummary.clicks.toLocaleString()} />
            <Metric label="CTR" value={`${overview.campaignPerformanceSummary.ctr.toFixed(2)}%`} />
            <Metric label="Conversions" value={overview.campaignPerformanceSummary.conversions.toLocaleString()} />
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Workspace</h2>
            <Badge className="bg-slate-100 text-slate-700">Admin-mediated</Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {recentCampaigns.map((campaign) => (
              <article key={campaign.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">{campaign.sponsorName}</p>
                <p className="text-sm text-slate-600">Contestant: {campaign.contestantSlug}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge className="bg-slate-100 text-slate-700">{campaign.campaignStatus.replace('_', ' ')}</Badge>
                  {campaign.paymentStatus === 'pending_manual' && (
                    <Badge className="bg-amber-100 text-amber-800">Payment waiting</Badge>
                  )}
                </div>
                <p className="mt-2 text-xs text-slate-600">{campaign.adminNotes}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Sponsorship badges and metrics do not affect the voting leaderboard.
        </section>
      </main>
    </div>
  );
}

function KpiCard({ label, value, helper }: { label: string; value: string; helper?: string }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
      {helper ? <p className="mt-1 text-xs text-slate-600">{helper}</p> : null}
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}
