'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SponsorLogoutButton } from '@/components/sponsors/sponsor-logout-button';
import { getSponsorContestantDetail } from '@/lib/api';
import {
  mockMarketplaceContestants,
  type MarketplaceContestant,
  type SocialPlatformMetric,
} from '@/lib/sponsorship-mock';

const LazyTrendChart = dynamic(
  () => import('@/components/sponsorship/lazy-trend-chart').then((m) => m.LazyTrendChart),
  { ssr: false, loading: () => <div className="h-40 animate-pulse rounded bg-slate-100" /> }
);

export default function SponsorContestantDetailPage() {
  const params = useParams<{ contestantSlug: string }>();
  const fallbackContestant = useMemo(
    () => mockMarketplaceContestants.find((item) => item.slug === params.contestantSlug) || null,
    [params.contestantSlug]
  );
  const [contestant, setContestant] = useState<MarketplaceContestant | null>(fallbackContestant);

  useEffect(() => {
    let mounted = true;
    if (!params.contestantSlug) return () => { mounted = false; };
    getSponsorContestantDetail(params.contestantSlug).then((res) => {
      if (!mounted || !res) return;
      setContestant(res);
    });
    return () => {
      mounted = false;
    };
  }, [params.contestantSlug]);

  if (!contestant) {
    return (
      <div className="min-h-screen bg-slate-100">
        <div className="mx-auto max-w-3xl px-4 py-12">
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <h1 className="text-xl font-semibold text-slate-900">Contestant not found</h1>
            <p className="mt-2 text-sm text-slate-600">This sponsor route is API-ready and could not resolve contestant data.</p>
            <Button asChild className="mt-4">
              <Link href="/sponsors/discover">Back to Discover</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const socialPlatforms = withPopularPlatforms(contestant.socialPlatforms);

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/sponsors/discover"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <p className="text-xs text-slate-500">Contestant Detail</p>
              <h1 className="text-2xl font-bold text-slate-900">{contestant.name}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild>
              <Link href={`/sponsors/campaigns?contestant=${contestant.slug}`}>Request Sponsorship</Link>
            </Button>
            <SponsorLogoutButton />
          </div>
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
            <div className="grid gap-3 md:grid-cols-2">
              {socialPlatforms.map((platform) => (
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
                  <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
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
              <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Tier {contestant.tier}</Badge>
              {contestant.trendingScore >= 80 && (
                <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Trending</Badge>
              )}
              {contestant.integrityStatus === 'verified' && (
                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Verified Integrity</Badge>
              )}
              {contestant.integrityStatus === 'under_review' && (
                <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Under Review</Badge>
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

function withPopularPlatforms(platforms: SocialPlatformMetric[]): SocialPlatformMetric[] {
  const today = new Date().toISOString();
  const popularDefaults: SocialPlatformMetric[] = [
    {
      platform: 'Instagram',
      username: '@instagram',
      followers: 0,
      engagementRate: 0,
      lastUpdated: today,
      externalUrl: 'https://instagram.com',
    },
    {
      platform: 'TikTok',
      username: '@tiktok',
      followers: 0,
      engagementRate: 0,
      lastUpdated: today,
      externalUrl: 'https://www.tiktok.com',
    },
    {
      platform: 'YouTube',
      username: '@youtube',
      followers: 0,
      engagementRate: 0,
      lastUpdated: today,
      externalUrl: 'https://youtube.com',
    },
    {
      platform: 'X',
      username: '@x',
      followers: 0,
      engagementRate: 0,
      lastUpdated: today,
      externalUrl: 'https://x.com',
    },
    {
      platform: 'Facebook',
      username: 'Facebook',
      followers: 0,
      engagementRate: 0,
      lastUpdated: today,
      externalUrl: 'https://facebook.com',
    },
    {
      platform: 'Snapchat',
      username: '@snapchat',
      followers: 0,
      engagementRate: 0,
      lastUpdated: today,
      externalUrl: 'https://www.snapchat.com',
    },
  ];

  const map = new Map(platforms.map((platform) => [platform.platform, platform]));
  for (const platform of popularDefaults) {
    if (!map.has(platform.platform)) {
      map.set(platform.platform, platform);
    }
  }

  return popularDefaults
    .map((platform) => map.get(platform.platform))
    .filter((platform): platform is SocialPlatformMetric => Boolean(platform));
}
