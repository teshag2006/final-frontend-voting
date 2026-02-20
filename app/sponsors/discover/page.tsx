'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Flame, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SponsorLogoutButton } from '@/components/sponsors/sponsor-logout-button';
import { getSponsorDiscoverContestants } from '@/lib/api';
import { mockMarketplaceContestants, type MarketplaceContestant } from '@/lib/sponsorship-mock';

const PAGE_SIZE = 3;

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

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur lg:-ml-[216px] lg:w-[calc(100%+216px)]">
        <div className="flex items-center justify-between gap-3 px-4 py-5 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Sponsorship Marketplace</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">Discover Contestants</h1>
          </div>
          <SponsorLogoutButton />
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Search contestant" />
            <Input
              value={industryCategory}
              onChange={(e) => { setIndustryCategory(e.target.value); setPage(1); }}
              placeholder="Industry category (future-ready)"
            />
            <div className="flex gap-2">
              {(['ALL', 'A', 'B', 'C'] as const).map((item) => (
                <Button
                  key={item}
                  type="button"
                  variant={tier === item ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => { setTier(item); setPage(1); }}
                >
                  Tier {item}
                </Button>
              ))}
            </div>
            <Input value={votesMin} onChange={(e) => { setVotesMin(e.target.value); setPage(1); }} placeholder="Votes min" type="number" />
            <Input value={followersMin} onChange={(e) => { setFollowersMin(e.target.value); setPage(1); }} placeholder="Followers min" type="number" />
            <Input value={engagementMin} onChange={(e) => { setEngagementMin(e.target.value); setPage(1); }} placeholder="Engagement % min" type="number" />
            <Button type="button" variant={trendingOnly ? 'default' : 'outline'} onClick={() => { setTrendingOnly((prev) => !prev); setPage(1); }}>
              Trending Only
            </Button>
            <Button type="button" variant={highIntegrityOnly ? 'default' : 'outline'} onClick={() => { setHighIntegrityOnly((prev) => !prev); setPage(1); }}>
              High Integrity Only
            </Button>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {paginated.map((contestant) => (
            <article key={contestant.slug} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <img src={contestant.profileImage} alt={contestant.name} className="h-12 w-12 rounded-full object-cover" />
                <div>
                  <h2 className="font-semibold text-slate-900">{contestant.name}</h2>
                  <p className="text-xs text-slate-500">Rank #{contestant.rank}</p>
                </div>
              </div>

              <div className="mb-4 grid grid-cols-2 gap-2 text-sm">
                <Stat label="Votes" value={contestant.votes.toLocaleString()} />
                <Stat label="Followers" value={contestant.followers.toLocaleString()} />
                <Stat label="Engagement" value={`${contestant.engagementRate.toFixed(1)}%`} />
                <Stat label="SDS" value={contestant.sds.toFixed(1)} />
              </div>

              <div className="mb-4 flex flex-wrap gap-2">
                <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Tier {contestant.tier}</Badge>
                {contestant.integrityStatus === 'verified' && (
                  <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Verified Integrity</Badge>
                )}
                {contestant.integrityStatus === 'under_review' && (
                  <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Under Review</Badge>
                )}
                {contestant.trendingScore >= 80 && (
                  <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                    <Flame className="mr-1 h-3 w-3" />
                    Trending
                  </Badge>
                )}
                {contestant.sponsored && <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Sponsored</Badge>}
              </div>

              <div className="flex gap-2">
                <Button asChild className="flex-1">
                  <Link href={`/sponsors/${contestant.slug}`}>View Details</Link>
                </Button>
                <Button asChild variant="outline" className="flex-1">
                  <Link href={`/sponsors/campaigns?contestant=${contestant.slug}`}>Request Sponsorship</Link>
                </Button>
              </div>
            </article>
          ))}
        </section>

        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3">
          <p className="text-sm text-slate-600">
            Page {activePage} of {totalPages} ({contestants.length} results)
          </p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" disabled={activePage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Previous
            </Button>
            <Button type="button" variant="outline" disabled={activePage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
              Next
            </Button>
          </div>
        </div>

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
