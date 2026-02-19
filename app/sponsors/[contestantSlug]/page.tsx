'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockMarketplaceContestants } from '@/lib/sponsorship-mock';

const LazyTrendChart = dynamic(
  () => import('@/components/sponsorship/lazy-trend-chart').then((m) => m.LazyTrendChart),
  { ssr: false, loading: () => <div className="h-40 animate-pulse rounded bg-slate-100" /> }
);

export default function SponsorContestantDetailPage({
  params,
}: {
  params: { contestantSlug: string };
}) {
  const contestant = mockMarketplaceContestants.find((item) => item.slug === params.contestantSlug);
  if (!contestant) return notFound();

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/sponsors"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <p className="text-xs text-slate-500">Contestant Detail</p>
              <h1 className="text-2xl font-bold text-slate-900">{contestant.name}</h1>
            </div>
          </div>
          <Button asChild>
            <Link href={`/sponsors/campaigns?contestant=${contestant.slug}`}>Request Sponsorship</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1.3fr_1fr] lg:px-8">
        <section className="space-y-6">
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Influence Overview</h2>
            <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <OverviewStat label="Votes" value={contestant.votes.toLocaleString()} helper={`${contestant.votes7dGrowth}% (7d)`} />
              <OverviewStat
                label="Followers"
                value={contestant.followers.toLocaleString()}
                helper={`${contestant.followers7dGrowth}% (7d)`}
              />
              <OverviewStat label="Engagement" value={`${contestant.engagementRate.toFixed(1)}%`} helper="Trend below" />
              <OverviewStat label="Integrity" value={`${contestant.integrityScore}`} helper={contestant.integrityStatus} />
            </div>
            <LazyTrendChart data={contestant.voteTrend7d} />
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Social Platforms</h2>
            <div className="space-y-3">
              {contestant.socialPlatforms.map((platform) => (
                <div key={platform.platform} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="font-semibold text-slate-900">{platform.platform}</p>
                    <a
                      href={platform.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-blue-700 hover:text-blue-800"
                    >
                      {platform.username}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <OverviewStat label="Followers" value={platform.followers.toLocaleString()} helper="" />
                    <OverviewStat label="Engagement" value={`${platform.engagementRate.toFixed(1)}%`} helper="" />
                    <OverviewStat
                      label="Last Updated"
                      value={new Date(platform.lastUpdated).toLocaleDateString()}
                      helper=""
                    />
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>

        <aside className="space-y-6">
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold text-slate-900">Sponsorship Tier</h2>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">⭐ Tier {contestant.tier}</Badge>
              {contestant.trendingScore >= 80 && (
                <Badge className="bg-red-100 text-red-700 hover:bg-red-100">🔥 Trending</Badge>
              )}
              {contestant.integrityStatus === 'verified' && (
                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">🛡 Verified Integrity</Badge>
              )}
              {contestant.integrityStatus === 'under_review' && (
                <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">⚠ Under Review</Badge>
              )}
            </div>
            <p className="mt-3 text-sm text-slate-600">
              Sponsorship indicators are isolated from voting rank computation.
            </p>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold text-slate-900">Past Campaign Success</h2>
            <p className="text-sm text-slate-600">
              Historical campaign performance will appear here in a future update.
            </p>
          </article>
        </aside>
      </main>
    </div>
  );
}

function OverviewStat({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm font-semibold text-slate-900">{value}</p>
      {helper ? <p className="text-xs text-slate-500">{helper}</p> : null}
    </div>
  );
}

