'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Flame, Search, ShieldCheck, SlidersHorizontal, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getSponsorDiscoverContestants } from '@/lib/api';
import { mockMarketplaceContestants, type MarketplaceContestant } from '@/lib/sponsorship-mock';

const PAGE_SIZE = 4;

export default function SponsorsDiscoverPage() {
  const [query, setQuery] = useState('');
  const [tier, setTier] = useState<'ALL' | 'A' | 'B' | 'C'>('ALL');
  const [trendingOnly, setTrendingOnly] = useState(false);
  const [highIntegrityOnly, setHighIntegrityOnly] = useState(false);
  const [votesMin, setVotesMin] = useState('');
  const [followersMin, setFollowersMin] = useState('');
  const [engagementMin, setEngagementMin] = useState('');
  const [industryCategory, setIndustryCategory] = useState('');
  const [page, setPage] = useState(1);
  const [apiContestants, setApiContestants] = useState<MarketplaceContestant[]>(mockMarketplaceContestants);

  useEffect(() => {
    let mounted = true;

    getSponsorDiscoverContestants({
      query,
      tier,
      trendingOnly,
      highIntegrityOnly,
      votesMin: votesMin ? Number(votesMin) : undefined,
      followersMin: followersMin ? Number(followersMin) : undefined,
      engagementMin: engagementMin ? Number(engagementMin) : undefined,
      industryCategory,
    }).then((res) => {
      if (!mounted || !res) return;
      setApiContestants(res);
    });

    return () => {
      mounted = false;
    };
  }, [query, tier, trendingOnly, highIntegrityOnly, votesMin, followersMin, engagementMin, industryCategory]);

  const contestants = useMemo(() => {
    const filtered = apiContestants
      .filter((contestant) => {
        if (query.trim() && !contestant.name.toLowerCase().includes(query.trim().toLowerCase())) return false;
        if (tier !== 'ALL' && contestant.tier !== tier) return false;
        if (trendingOnly && contestant.trendingScore < 80) return false;
        if (highIntegrityOnly && contestant.integrityStatus !== 'verified') return false;
        if (votesMin && contestant.votes < Number(votesMin)) return false;
        if (followersMin && contestant.followers < Number(followersMin)) return false;
        if (engagementMin && contestant.engagementRate < Number(engagementMin)) return false;
        if (industryCategory.trim()) {
          const normalized = industryCategory.trim().toLowerCase();
          if (!contestant.category.toLowerCase().includes(normalized)) return false;
        }
        return true;
      })
      .sort((a, b) => b.sds - a.sds);

    return filtered;
  }, [apiContestants, query, tier, trendingOnly, highIntegrityOnly, votesMin, followersMin, engagementMin, industryCategory]);

  const totalPages = Math.max(1, Math.ceil(contestants.length / PAGE_SIZE));
  const activePage = Math.min(page, totalPages);
  const paginated = contestants.slice((activePage - 1) * PAGE_SIZE, activePage * PAGE_SIZE);
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);
  const maxVotes = Math.max(...apiContestants.map((item) => item.votes), 1000);
  const maxFollowers = Math.max(...apiContestants.map((item) => item.followers), 1000);
  const maxEngagement = Math.max(...apiContestants.map((item) => item.engagementRate), 10);

  return (
    <div className="min-h-screen bg-slate-100/80">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-5 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Sponsorship Marketplace</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">Discover Contestants</h1>
            <p className="mt-1 text-sm text-slate-600">
              Find potential contestants to sponsor using filters and integrity scores.
            </p>
          </div>
        </div>
      </header>

      <main className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <section className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="h-fit space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm xl:sticky xl:top-32">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search contestants..."
                className="pl-9"
              />
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="mb-2 text-sm font-semibold text-slate-900">Industry</p>
              <Input
                value={industryCategory}
                onChange={(e) => {
                  setIndustryCategory(e.target.value);
                  setPage(1);
                }}
                placeholder="e.g. Fashion, Sports"
              />
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="mb-2 text-sm font-semibold text-slate-900">Tier</p>
              <div className="grid grid-cols-4 gap-2">
                {(['ALL', 'A', 'B', 'C'] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setTier(item);
                      setPage(1);
                    }}
                    className={`rounded-md border px-2 py-1.5 text-sm font-medium ${
                      tier === item
                        ? 'border-amber-300 bg-amber-100 text-amber-900'
                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <FilterSlider
              label="Votes"
              value={votesMin ? Number(votesMin) : 0}
              max={maxVotes}
              onChange={(value) => {
                setVotesMin(value > 0 ? String(value) : '');
                setPage(1);
              }}
            />
            <FilterSlider
              label="Followers"
              value={followersMin ? Number(followersMin) : 0}
              max={maxFollowers}
              onChange={(value) => {
                setFollowersMin(value > 0 ? String(value) : '');
                setPage(1);
              }}
            />
            <FilterSlider
              label="Engagement %"
              value={engagementMin ? Number(engagementMin) : 0}
              max={Math.ceil(maxEngagement)}
              onChange={(value) => {
                setEngagementMin(value > 0 ? String(value) : '');
                setPage(1);
              }}
            />

            <label className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
              <span className="inline-flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-700" />
                Trending only
              </span>
              <input
                type="checkbox"
                checked={trendingOnly}
                onChange={(e) => {
                  setTrendingOnly(e.target.checked);
                  setPage(1);
                }}
                className="h-4 w-4 rounded border-slate-300"
              />
            </label>
            <label className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-700" />
                High integrity only
              </span>
              <input
                type="checkbox"
                checked={highIntegrityOnly}
                onChange={(e) => {
                  setHighIntegrityOnly(e.target.checked);
                  setPage(1);
                }}
                className="h-4 w-4 rounded border-slate-300"
              />
            </label>

            <Button className="w-full" onClick={() => setPage(1)}>
              Show {contestants.length} Results
            </Button>

            <article className="rounded-xl border border-blue-100 bg-blue-50/70 p-3 text-sm text-blue-900">
              <p className="font-medium">Contestants are ranked by Sponsorship Discovery Score (SDS).</p>
              <p className="mt-2 text-blue-800">
                We uphold high integrity standards for sponsored campaigns.
              </p>
              <Link href="/sponsors/settings" className="mt-2 inline-block font-medium text-blue-700">
                Integrity Details
              </Link>
            </article>
          </aside>

          <section className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filter Panel
                </p>
                <p className="text-sm text-slate-500">
                  Page {activePage} of {totalPages}
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
              {paginated.map((contestant) => (
                <article key={contestant.slug} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="relative h-44">
                    <img src={contestant.profileImage} alt={contestant.name} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent" />
                    <div className="absolute left-3 top-3 rounded-md bg-slate-900/80 px-2 py-1 text-xs font-semibold text-white">
                      #{contestant.rank}
                    </div>
                    <div className="absolute right-3 top-3 flex flex-wrap gap-1">
                      <Badge className="bg-amber-100 text-amber-900 hover:bg-amber-100">Tier {contestant.tier}</Badge>
                      {contestant.integrityStatus === 'verified' && (
                        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Verified</Badge>
                      )}
                      {contestant.trendingScore >= 80 && (
                        <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                          <Flame className="mr-1 h-3 w-3" />
                          Trending
                        </Badge>
                      )}
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <h2 className="text-3xl font-semibold text-white">{contestant.name}</h2>
                      <p className="text-sm text-slate-100">{contestant.category}</p>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="mb-3 grid grid-cols-2 gap-2">
                      <Stat label="Votes" value={contestant.votes.toLocaleString()} />
                      <Stat label="Followers" value={contestant.followers.toLocaleString()} />
                      <Stat label="Engagement" value={`${contestant.engagementRate.toFixed(1)}%`} />
                      <Stat label="SDS" value={contestant.sds.toFixed(1)} />
                    </div>

                    <div className="mb-3 flex flex-wrap gap-2">
                      {contestant.sponsored && <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Sponsored</Badge>}
                      {contestant.integrityStatus === 'under_review' && (
                        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Under Review</Badge>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button asChild variant="outline" className="flex-1">
                        <Link href={`/sponsors/${contestant.slug}`}>View Details</Link>
                      </Button>
                      <Button asChild className="flex-1">
                        <Link href={`/sponsors/campaigns?contestant=${contestant.slug}`}>Request Sponsorship</Link>
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {paginated.length === 0 && (
              <article className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-600 shadow-sm">
                No contestants match the selected filters.
              </article>
            )}

            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <p className="text-sm text-slate-600">
                Page {activePage} of {totalPages} ({contestants.length} results)
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={activePage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                {pageNumbers.map((pageNumber) => (
                  <Button
                    key={pageNumber}
                    type="button"
                    variant={pageNumber === activePage ? 'default' : 'outline'}
                    onClick={() => setPage(pageNumber)}
                    className="h-9 min-w-9 px-3"
                  >
                    {pageNumber}
                  </Button>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  disabled={activePage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          </section>
        </section>

        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <div className="flex items-center gap-2 font-medium">
            <ShieldCheck className="h-4 w-4" />
            Badges are visual indicators and do not affect voting leaderboard rank.
          </div>
        </div>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function FilterSlider({
  label,
  value,
  max,
  onChange,
}: {
  label: string;
  value: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="mb-2 flex items-center justify-between text-sm">
        <p className="font-semibold text-slate-900">{label}</p>
        <p className="text-slate-500">{value > 0 ? value.toLocaleString() : 'Any'}</p>
      </div>
      <input
        type="range"
        value={Math.min(value, max)}
        min={0}
        max={max}
        step={1}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-blue-700"
      />
    </div>
  );
}
