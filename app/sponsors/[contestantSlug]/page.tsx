'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ArrowLeft, Flame, ShieldCheck, Sparkles, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getSponsorCampaignTracking, getSponsorContestantDetail } from '@/lib/api';
import {
  mockMarketplaceContestants,
  mockSponsorCampaignTracking,
  type MarketplaceContestant,
  type SocialPlatformMetric,
  type SponsorCampaignTracking,
} from '@/lib/sponsorship-mock';

const LazyTrendChart = dynamic(
  () => import('@/components/sponsorship/lazy-trend-chart').then((m) => m.LazyTrendChart),
  { ssr: false, loading: () => <div className="h-52 animate-pulse rounded-xl bg-slate-100" /> }
);

const TABS = ['General', 'Contact', 'Legal', 'Security'] as const;

export default function SponsorContestantDetailPage() {
  const params = useParams<{ contestantSlug: string }>();
  const fallbackContestant = useMemo(
    () => mockMarketplaceContestants.find((item) => item.slug === params.contestantSlug) || null,
    [params.contestantSlug]
  );

  const [contestant, setContestant] = useState<MarketplaceContestant | null>(fallbackContestant);
  const [campaigns, setCampaigns] = useState<SponsorCampaignTracking[]>(
    mockSponsorCampaignTracking.filter((item) => item.contestantSlug === params.contestantSlug)
  );
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>('General');

  useEffect(() => {
    let mounted = true;
    if (!params.contestantSlug) return () => { mounted = false; };

    Promise.all([getSponsorContestantDetail(params.contestantSlug), getSponsorCampaignTracking(params.contestantSlug)]).then(
      ([contestantRes, campaignRes]) => {
        if (!mounted) return;
        if (contestantRes) setContestant(contestantRes);
        if (campaignRes) setCampaigns(campaignRes);
      }
    );

    return () => {
      mounted = false;
    };
  }, [params.contestantSlug]);

  if (!contestant) {
    return (
      <div className="min-h-screen bg-slate-100 px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">Contestant not found</h1>
          <p className="mt-3 text-slate-600">This detail route could not resolve data for the selected contestant.</p>
          <Button asChild className="mt-5">
            <Link href="/sponsors/discover">Back to Discover</Link>
          </Button>
        </div>
      </div>
    );
  }

  const socialPlatforms = withPopularPlatforms(contestant.socialPlatforms);
  const topProfile = socialPlatforms.find((item) => item.followers > 0);
  const campaignItems = campaigns.length > 0 ? campaigns : mockSponsorCampaignTracking.filter((item) => item.contestantSlug === contestant.slug);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#f8fafc,_#eef2ff_45%,_#e2e8f0_100%)] px-3 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-4">
        <header className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm backdrop-blur">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <Link
                href="/sponsors/discover"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-100"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{contestant.name}</h1>
                <p className="mt-1 text-sm text-slate-600">
                  {contestant.category} | Rank #{contestant.rank}
                </p>
              </div>
            </div>
            <Button
              asChild
              className="rounded-xl border border-amber-300 bg-gradient-to-r from-amber-300 to-yellow-300 px-6 py-2 font-semibold text-slate-900 hover:from-amber-200 hover:to-yellow-200"
            >
              <Link href={`/sponsors/campaigns?contestant=${contestant.slug}`}>Request Sponsorship</Link>
            </Button>
          </div>
        </header>

        <div className="grid gap-4 xl:grid-cols-[1.85fr_1fr]">
          <section className="space-y-4">
            <article className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
              <div className="relative h-72 w-full sm:h-80">
                <img src={contestant.profileImage} alt={contestant.name} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent" />
                <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                  <Badge className="bg-white/90 text-slate-900">Tier {contestant.tier}</Badge>
                  {contestant.trendingScore >= 80 ? (
                    <Badge className="bg-rose-100 text-rose-700">
                      <Flame className="mr-1 h-3 w-3" />
                      Trending
                    </Badge>
                  ) : null}
                  <Badge className={integrityTone(contestant.integrityStatus)}>{integrityLabel(contestant.integrityStatus)}</Badge>
                </div>
                <div className="absolute bottom-4 left-4 right-4 grid gap-2 text-white sm:grid-cols-3">
                  <OverlayStat label="Votes" value={contestant.votes.toLocaleString()} />
                  <OverlayStat label="Followers" value={contestant.followers.toLocaleString()} />
                  <OverlayStat label="Engagement" value={`${contestant.engagementRate.toFixed(1)}%`} />
                </div>
              </div>
              <div className="border-t border-slate-200 bg-slate-50/70 px-4">
                <nav className="flex items-center gap-5 overflow-x-auto py-3" aria-label="Contestant detail tabs">
                  {TABS.map((tab) => (
                    <button
                      type="button"
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      aria-selected={activeTab === tab}
                      className={`whitespace-nowrap border-b-2 pb-2 text-sm ${
                        activeTab === tab ? 'border-blue-700 font-semibold text-slate-900' : 'border-transparent text-slate-500'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </nav>
              </div>
            </article>

            <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <h2 className="text-2xl font-semibold text-slate-900">{activeTab} Overview</h2>
              <div className="mt-4 grid gap-3">
                {activeTab === 'General' ? (
                  <>
                    <Field label="Company Name" value={`${contestant.name} Talent Partnerships`} />
                    <Field label="Industry" value={contestant.category} />
                    <Field
                      label="About"
                      value={`${contestant.name} is currently ranked #${contestant.rank} with ${contestant.votes.toLocaleString()} votes and ${contestant.followers.toLocaleString()} followers. Last 7 days: ${signedPercent(contestant.votes7dGrowth)} votes, ${signedPercent(contestant.followers7dGrowth)} followers.`}
                      multiLine
                    />
                  </>
                ) : null}
                {activeTab === 'Contact' ? (
                  <>
                    <Field label="Primary Handle" value={topProfile?.username || 'Not available'} />
                    <Field label="Primary Platform" value={topProfile?.platform || 'Not available'} />
                    <Field label="Region" value="Global Audience Reach" />
                  </>
                ) : null}
                {activeTab === 'Legal' ? (
                  <>
                    <Field label="Sponsorship Tier Eligibility" value={`Tier ${contestant.tier}`} />
                    <Field label="Integrity Status" value={integrityLabel(contestant.integrityStatus)} />
                    <Field label="Integrity Confidence" value={`${contestant.integrityScore}%`} />
                    <Field label="Compliance Note" value="Sponsorship metrics are isolated from vote rank computation." multiLine />
                  </>
                ) : null}
                {activeTab === 'Security' ? (
                  <>
                    <Field label="Integrity Monitoring" value={integrityMessage(contestant.integrityStatus)} multiLine />
                    <Field label="Trending Signal" value={`${contestant.trendingScore}/100`} />
                    <Field label="SDS" value={`${contestant.sds.toFixed(1)}/100`} />
                    <Field label="Fraud Risk Window" value={contestant.integrityStatus === 'flagged' ? 'Elevated' : 'Normal'} />
                  </>
                ) : null}
              </div>
            </article>

            <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-2xl font-semibold text-slate-900">Social Breakdown</h2>
                <p className="text-sm text-slate-500">Live connected handles</p>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="min-w-full bg-white">
                  <thead className="bg-slate-50">
                    <tr className="text-left text-xs uppercase tracking-[0.08em] text-slate-500">
                      <th className="px-3 py-3 font-medium">Platform</th>
                      <th className="px-3 py-3 font-medium">Username</th>
                      <th className="px-3 py-3 font-medium">Followers</th>
                      <th className="px-3 py-3 font-medium">Engagement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {socialPlatforms.map((platform) => (
                      <tr key={platform.platform} className="border-t border-slate-100 text-sm text-slate-700">
                        <td className="px-3 py-3 font-medium text-slate-900">{platform.platform}</td>
                        <td className="px-3 py-3">{platform.username}</td>
                        <td className="px-3 py-3">{platform.followers.toLocaleString()}</td>
                        <td className="px-3 py-3">{platform.engagementRate.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          </section>

          <aside className="space-y-4">
            <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <h2 className="text-2xl font-semibold text-slate-900">Sponsorship Tier</h2>
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-lg font-bold text-white">
                      {contestant.tier}
                    </span>
                    <div>
                      <p className="text-lg font-semibold text-slate-900">Tier {contestant.tier}</p>
                      <p className="text-sm text-slate-500">#{contestant.rank} in marketplace</p>
                    </div>
                  </div>
                  <div className="rounded-xl bg-blue-100 px-3 py-2 text-right">
                    <p className="text-xs uppercase tracking-wide text-blue-700">SDS</p>
                    <p className="text-3xl font-bold leading-none text-blue-800">{Math.round(contestant.sds)}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-600">
                  Sponsorship Discovery Score {contestant.sds.toFixed(1)} / 100
                </p>
              </div>
            </article>

            <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                {contestant.integrityStatus === 'flagged' ? (
                  <AlertTriangle className="mt-1 h-5 w-5 text-amber-600" />
                ) : (
                  <ShieldCheck className="mt-1 h-5 w-5 text-emerald-600" />
                )}
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">Integrity Score</h2>
                  <p className="mt-1 text-sm text-slate-600">{integrityMessage(contestant.integrityStatus)}</p>
                  <div className="mt-3 h-2 w-full rounded-full bg-slate-200">
                    <div
                      className={`h-full rounded-full ${contestant.integrityStatus === 'flagged' ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min(100, Math.max(0, contestant.integrityScore))}%` }}
                    />
                  </div>
                  <p className="mt-2 text-sm font-semibold text-slate-800">{contestant.integrityScore}% integrity confidence</p>
                </div>
              </div>
            </article>

            <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <h2 className="text-2xl font-semibold text-slate-900">Past Campaign Results</h2>
              <div className="mt-4 space-y-3">
                {campaignItems.length > 0 ? (
                  campaignItems.map((campaign) => (
                    <div key={campaign.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="inline-flex items-center gap-2 font-semibold text-slate-900">
                        <Trophy className="h-4 w-4 text-blue-700" />
                        {campaign.sponsorName}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">Status: {campaign.campaignStatus.replace('_', ' ')}</p>
                      <p className="text-sm text-slate-600">
                        Deliverables: {campaign.deliverablesSubmitted}/{campaign.deliverablesTotal}
                      </p>
                      <div className="mt-2 h-1.5 rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-blue-600"
                          style={{ width: `${Math.round((campaign.deliverablesSubmitted / Math.max(campaign.deliverablesTotal, 1)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-600">No campaign history yet.</p>
                )}
              </div>
            </article>

            <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-700" />
                <h2 className="text-lg font-semibold text-slate-900">7-Day Vote Momentum</h2>
              </div>
              <LazyTrendChart data={contestant.voteTrend7d} />
            </article>
          </aside>
        </div>
      </div>
    </div>
  );
}

function OverlayStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/20 bg-slate-900/35 px-3 py-2 backdrop-blur-sm">
      <p className="text-xs text-slate-200">{label}</p>
      <p className="text-base font-semibold">{value}</p>
    </div>
  );
}

function Field({
  label,
  value,
  icon,
  multiLine = false,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  multiLine?: boolean;
}) {
  return (
    <div>
      <p className="mb-1 text-sm text-slate-500">{label}</p>
      <div className={`rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 ${multiLine ? 'min-h-20' : ''}`}>
        <p className={`inline-flex items-center gap-2 text-slate-800 ${multiLine ? 'leading-relaxed' : ''}`}>
          {icon}
          {value}
        </p>
      </div>
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
    },
    {
      platform: 'TikTok',
      username: '@tiktok',
      followers: 0,
      engagementRate: 0,
      lastUpdated: today,
    },
    {
      platform: 'YouTube',
      username: '@youtube',
      followers: 0,
      engagementRate: 0,
      lastUpdated: today,
    },
    {
      platform: 'X',
      username: '@x',
      followers: 0,
      engagementRate: 0,
      lastUpdated: today,
    },
    {
      platform: 'Facebook',
      username: 'Facebook',
      followers: 0,
      engagementRate: 0,
      lastUpdated: today,
    },
    {
      platform: 'Snapchat',
      username: '@snapchat',
      followers: 0,
      engagementRate: 0,
      lastUpdated: today,
    },
  ];

  const map = new Map(platforms.map((platform) => [platform.platform, platform]));
  for (const platform of popularDefaults) {
    if (!map.has(platform.platform)) map.set(platform.platform, platform);
  }

  return popularDefaults
    .map((platform) => map.get(platform.platform))
    .filter((platform): platform is SocialPlatformMetric => Boolean(platform));
}

function integrityTone(status: MarketplaceContestant['integrityStatus']) {
  if (status === 'verified') return 'bg-emerald-100 text-emerald-800';
  if (status === 'under_review') return 'bg-amber-100 text-amber-800';
  return 'bg-rose-100 text-rose-700';
}

function integrityLabel(status: MarketplaceContestant['integrityStatus']) {
  if (status === 'verified') return 'Verified Integrity';
  if (status === 'under_review') return 'Under Review';
  return 'Flagged';
}

function integrityMessage(status: MarketplaceContestant['integrityStatus']) {
  if (status === 'verified') return 'All recent sponsorship votes passed integrity checks.';
  if (status === 'under_review') return 'Integrity checks are in progress for the latest activity window.';
  return 'Integrity risk signals are elevated and under active review.';
}

function signedPercent(value: number) {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}
