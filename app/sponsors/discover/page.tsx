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
  const [gender, setGender] = useState<'ALL' | 'female' | 'male' | 'non_binary' | 'prefer_not_to_say'>('ALL');
  const [ageMin, setAgeMin] = useState('');
  const [ageMax, setAgeMax] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [region, setRegion] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [sponsoredStatus, setSponsoredStatus] = useState<'ALL' | 'SPONSORED' | 'UNSPONSORED'>('ALL');
  const [votesGrowthMin, setVotesGrowthMin] = useState('');
  const [followersGrowthMin, setFollowersGrowthMin] = useState('');
  const [integrityScoreMin, setIntegrityScoreMin] = useState('0');
  const [integrityScoreMax, setIntegrityScoreMax] = useState('100');
  const [instagramFollowersMin, setInstagramFollowersMin] = useState('');
  const [tiktokFollowersMin, setTiktokFollowersMin] = useState('');
  const [youtubeFollowersMin, setYoutubeFollowersMin] = useState('');
  const [engagementQualityMin, setEngagementQualityMin] = useState('0');
  const [fraudRiskMax, setFraudRiskMax] = useState('100');
  const [profileCompletionMin, setProfileCompletionMin] = useState('0');
  const [responseRateMin, setResponseRateMin] = useState('0');
  const [deliverableCompletionMin, setDeliverableCompletionMin] = useState('0');
  const [readyNowOnly, setReadyNowOnly] = useState(false);
  const [availableFrom, setAvailableFrom] = useState('');
  const [availableTo, setAvailableTo] = useState('');
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
      gender,
      ageMin: ageMin ? Number(ageMin) : undefined,
      ageMax: ageMax ? Number(ageMax) : undefined,
      categories,
      country,
      city,
      region,
      budgetMin: budgetMin ? Number(budgetMin) : undefined,
      budgetMax: budgetMax ? Number(budgetMax) : undefined,
      sponsoredStatus,
      votesGrowthMin: votesGrowthMin ? Number(votesGrowthMin) : undefined,
      followersGrowthMin: followersGrowthMin ? Number(followersGrowthMin) : undefined,
      integrityScoreMin: integrityScoreMin ? Number(integrityScoreMin) : undefined,
      integrityScoreMax: integrityScoreMax ? Number(integrityScoreMax) : undefined,
      instagramFollowersMin: instagramFollowersMin ? Number(instagramFollowersMin) : undefined,
      tiktokFollowersMin: tiktokFollowersMin ? Number(tiktokFollowersMin) : undefined,
      youtubeFollowersMin: youtubeFollowersMin ? Number(youtubeFollowersMin) : undefined,
      engagementQualityMin: engagementQualityMin ? Number(engagementQualityMin) : undefined,
      fraudRiskMax: fraudRiskMax ? Number(fraudRiskMax) : undefined,
      profileCompletionMin: profileCompletionMin ? Number(profileCompletionMin) : undefined,
      responseRateMin: responseRateMin ? Number(responseRateMin) : undefined,
      deliverableCompletionMin: deliverableCompletionMin ? Number(deliverableCompletionMin) : undefined,
      readyNowOnly,
      availableFrom: availableFrom || undefined,
      availableTo: availableTo || undefined,
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
  }, [
    query,
    tier,
    gender,
    ageMin,
    ageMax,
    categories,
    country,
    city,
    region,
    budgetMin,
    budgetMax,
    sponsoredStatus,
    votesGrowthMin,
    followersGrowthMin,
    integrityScoreMin,
    integrityScoreMax,
    instagramFollowersMin,
    tiktokFollowersMin,
    youtubeFollowersMin,
    engagementQualityMin,
    fraudRiskMax,
    profileCompletionMin,
    responseRateMin,
    deliverableCompletionMin,
    readyNowOnly,
    availableFrom,
    availableTo,
    trendingOnly,
    highIntegrityOnly,
    votesMin,
    followersMin,
    engagementMin,
    industryCategory,
  ]);

  const contestants = useMemo(() => {
    const filtered = apiContestants
      .filter((contestant) => {
        const instagramFollowers = contestant.socialPlatforms.find((item) => item.platform === 'Instagram')?.followers || 0;
        const tiktokFollowers = contestant.socialPlatforms.find((item) => item.platform === 'TikTok')?.followers || 0;
        const youtubeFollowers = contestant.socialPlatforms.find((item) => item.platform === 'YouTube')?.followers || 0;
        const availableDate = new Date(contestant.availableFrom).getTime();
        const availableFromTime = availableFrom ? new Date(availableFrom).getTime() : Number.NaN;
        const availableToTime = availableTo ? new Date(availableTo).getTime() : Number.NaN;

        if (query.trim() && !contestant.name.toLowerCase().includes(query.trim().toLowerCase())) return false;
        if (tier !== 'ALL' && contestant.tier !== tier) return false;
        if (gender !== 'ALL' && contestant.gender !== gender) return false;
        if (ageMin && contestant.age < Number(ageMin)) return false;
        if (ageMax && contestant.age > Number(ageMax)) return false;
        if (categories.length > 0 && !categories.includes(contestant.category)) return false;
        if (country.trim() && contestant.location.country.toLowerCase() !== country.trim().toLowerCase()) return false;
        if (city.trim() && contestant.location.city.toLowerCase() !== city.trim().toLowerCase()) return false;
        if (region.trim() && contestant.location.region.toLowerCase() !== region.trim().toLowerCase()) return false;
        if (budgetMin && contestant.expectedSponsorshipUsd < Number(budgetMin)) return false;
        if (budgetMax && contestant.expectedSponsorshipUsd > Number(budgetMax)) return false;
        if (sponsoredStatus === 'SPONSORED' && !contestant.sponsored) return false;
        if (sponsoredStatus === 'UNSPONSORED' && contestant.sponsored) return false;
        if (votesGrowthMin && contestant.votes7dGrowth < Number(votesGrowthMin)) return false;
        if (followersGrowthMin && contestant.followers7dGrowth < Number(followersGrowthMin)) return false;
        if (contestant.integrityScore < Number(integrityScoreMin)) return false;
        if (contestant.integrityScore > Number(integrityScoreMax)) return false;
        if (instagramFollowersMin && instagramFollowers < Number(instagramFollowersMin)) return false;
        if (tiktokFollowersMin && tiktokFollowers < Number(tiktokFollowersMin)) return false;
        if (youtubeFollowersMin && youtubeFollowers < Number(youtubeFollowersMin)) return false;
        if (contestant.engagementQualityScore < Number(engagementQualityMin)) return false;
        if (contestant.fraudRiskScore > Number(fraudRiskMax)) return false;
        if (contestant.profileCompletion < Number(profileCompletionMin)) return false;
        if (contestant.responseRatePct < Number(responseRateMin)) return false;
        if (contestant.deliverableCompletionPct < Number(deliverableCompletionMin)) return false;
        if (readyNowOnly && !contestant.readyNow) return false;
        if (!Number.isNaN(availableFromTime) && availableDate < availableFromTime) return false;
        if (!Number.isNaN(availableToTime) && availableDate > availableToTime) return false;
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
  }, [
    apiContestants,
    query,
    tier,
    gender,
    ageMin,
    ageMax,
    categories,
    country,
    city,
    region,
    budgetMin,
    budgetMax,
    sponsoredStatus,
    votesGrowthMin,
    followersGrowthMin,
    integrityScoreMin,
    integrityScoreMax,
    instagramFollowersMin,
    tiktokFollowersMin,
    youtubeFollowersMin,
    engagementQualityMin,
    fraudRiskMax,
    profileCompletionMin,
    responseRateMin,
    deliverableCompletionMin,
    readyNowOnly,
    availableFrom,
    availableTo,
    trendingOnly,
    highIntegrityOnly,
    votesMin,
    followersMin,
    engagementMin,
    industryCategory,
  ]);

  const totalPages = Math.max(1, Math.ceil(contestants.length / PAGE_SIZE));
  const activePage = Math.min(page, totalPages);
  const paginated = contestants.slice((activePage - 1) * PAGE_SIZE, activePage * PAGE_SIZE);
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);
  const maxVotes = Math.max(...apiContestants.map((item) => item.votes), 1000);
  const maxFollowers = Math.max(...apiContestants.map((item) => item.followers), 1000);
  const maxEngagement = Math.max(...apiContestants.map((item) => item.engagementRate), 10);
  const maxBudget = Math.max(...apiContestants.map((item) => item.expectedSponsorshipUsd), 1000);
  const maxInstagramFollowers = Math.max(
    ...apiContestants.map((item) => item.socialPlatforms.find((platform) => platform.platform === 'Instagram')?.followers || 0),
    1000
  );
  const maxTikTokFollowers = Math.max(
    ...apiContestants.map((item) => item.socialPlatforms.find((platform) => platform.platform === 'TikTok')?.followers || 0),
    1000
  );
  const maxYouTubeFollowers = Math.max(
    ...apiContestants.map((item) => item.socialPlatforms.find((platform) => platform.platform === 'YouTube')?.followers || 0),
    1000
  );
  const categoryOptions = Array.from(new Set(apiContestants.map((item) => item.category))).sort();

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
              <p className="mb-2 text-sm font-semibold text-slate-900">Category (Exact)</p>
              <div className="grid grid-cols-1 gap-1">
                {categoryOptions.map((item) => (
                  <label key={item} className="inline-flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={categories.includes(item)}
                      onChange={(e) => {
                        setCategories((prev) =>
                          e.target.checked ? [...prev, item] : prev.filter((entry) => entry !== item)
                        );
                        setPage(1);
                      }}
                      className="h-4 w-4 rounded border-slate-300"
                    />
                    {item}
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="mb-2 text-sm font-semibold text-slate-900">Location</p>
              <div className="grid grid-cols-1 gap-2">
                <Input
                  value={country}
                  onChange={(e) => {
                    setCountry(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Country"
                />
                <Input
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    setPage(1);
                  }}
                  placeholder="City"
                />
                <Input
                  value={region}
                  onChange={(e) => {
                    setRegion(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Region"
                />
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="mb-2 text-sm font-semibold text-slate-900">Gender</p>
              <select
                value={gender}
                onChange={(e) => {
                  setGender(e.target.value as typeof gender);
                  setPage(1);
                }}
                className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800"
              >
                <option value="ALL">All</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="non_binary">Non-binary</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="mb-2 text-sm font-semibold text-slate-900">Age Range</p>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  min={13}
                  max={120}
                  value={ageMin}
                  onChange={(e) => {
                    setAgeMin(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Min"
                />
                <Input
                  type="number"
                  min={13}
                  max={120}
                  value={ageMax}
                  onChange={(e) => {
                    setAgeMax(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Max"
                />
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="mb-2 text-sm font-semibold text-slate-900">Tier</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
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

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="mb-2 text-sm font-semibold text-slate-900">Sponsored Status</p>
              <select
                value={sponsoredStatus}
                onChange={(e) => {
                  setSponsoredStatus(e.target.value as typeof sponsoredStatus);
                  setPage(1);
                }}
                className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800"
              >
                <option value="ALL">All</option>
                <option value="SPONSORED">Already Sponsored</option>
                <option value="UNSPONSORED">Not Sponsored Yet</option>
              </select>
            </div>

            <FilterSlider
              label="Budget Min (USD)"
              value={budgetMin ? Number(budgetMin) : 0}
              max={maxBudget}
              onChange={(value) => {
                setBudgetMin(value > 0 ? String(value) : '');
                setPage(1);
              }}
            />
            <FilterSlider
              label="Budget Max (USD)"
              value={budgetMax ? Number(budgetMax) : maxBudget}
              max={maxBudget}
              onChange={(value) => {
                setBudgetMax(value > 0 ? String(value) : '');
                setPage(1);
              }}
            />

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
            <FilterSlider
              label="Votes 7d Growth Min %"
              value={votesGrowthMin ? Number(votesGrowthMin) : 0}
              max={30}
              onChange={(value) => {
                setVotesGrowthMin(value > 0 ? String(value) : '');
                setPage(1);
              }}
            />
            <FilterSlider
              label="Followers 7d Growth Min %"
              value={followersGrowthMin ? Number(followersGrowthMin) : 0}
              max={20}
              onChange={(value) => {
                setFollowersGrowthMin(value > 0 ? String(value) : '');
                setPage(1);
              }}
            />
            <FilterSlider
              label="Integrity Score Min"
              value={Number(integrityScoreMin)}
              max={100}
              onChange={(value) => {
                setIntegrityScoreMin(String(value));
                setPage(1);
              }}
            />
            <FilterSlider
              label="Integrity Score Max"
              value={Number(integrityScoreMax)}
              max={100}
              onChange={(value) => {
                setIntegrityScoreMax(String(value));
                setPage(1);
              }}
            />
            <FilterSlider
              label="Instagram Followers Min"
              value={instagramFollowersMin ? Number(instagramFollowersMin) : 0}
              max={maxInstagramFollowers}
              onChange={(value) => {
                setInstagramFollowersMin(value > 0 ? String(value) : '');
                setPage(1);
              }}
            />
            <FilterSlider
              label="TikTok Followers Min"
              value={tiktokFollowersMin ? Number(tiktokFollowersMin) : 0}
              max={maxTikTokFollowers}
              onChange={(value) => {
                setTiktokFollowersMin(value > 0 ? String(value) : '');
                setPage(1);
              }}
            />
            <FilterSlider
              label="YouTube Followers Min"
              value={youtubeFollowersMin ? Number(youtubeFollowersMin) : 0}
              max={maxYouTubeFollowers}
              onChange={(value) => {
                setYoutubeFollowersMin(value > 0 ? String(value) : '');
                setPage(1);
              }}
            />
            <FilterSlider
              label="Engagement Quality Min"
              value={Number(engagementQualityMin)}
              max={100}
              onChange={(value) => {
                setEngagementQualityMin(String(value));
                setPage(1);
              }}
            />
            <FilterSlider
              label="Fraud Risk Max"
              value={Number(fraudRiskMax)}
              max={100}
              onChange={(value) => {
                setFraudRiskMax(String(value));
                setPage(1);
              }}
            />
            <FilterSlider
              label="Profile Completion Min"
              value={Number(profileCompletionMin)}
              max={100}
              onChange={(value) => {
                setProfileCompletionMin(String(value));
                setPage(1);
              }}
            />
            <FilterSlider
              label="Response Rate Min"
              value={Number(responseRateMin)}
              max={100}
              onChange={(value) => {
                setResponseRateMin(String(value));
                setPage(1);
              }}
            />
            <FilterSlider
              label="Deliverable Completion Min"
              value={Number(deliverableCompletionMin)}
              max={100}
              onChange={(value) => {
                setDeliverableCompletionMin(String(value));
                setPage(1);
              }}
            />

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="mb-2 text-sm font-semibold text-slate-900">Availability Window</p>
              <div className="grid grid-cols-1 gap-2">
                <Input
                  type="date"
                  value={availableFrom}
                  onChange={(e) => {
                    setAvailableFrom(e.target.value);
                    setPage(1);
                  }}
                />
                <Input
                  type="date"
                  value={availableTo}
                  onChange={(e) => {
                    setAvailableTo(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
            </div>

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
            <label className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-700" />
                Ready now only
              </span>
              <input
                type="checkbox"
                checked={readyNowOnly}
                onChange={(e) => {
                  setReadyNowOnly(e.target.checked);
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
                      <p className="text-sm text-slate-100">
                        {contestant.category} | {contestant.age} yrs | {contestant.gender.replace(/_/g, ' ')}
                      </p>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="mb-3 grid grid-cols-2 gap-2">
                      <Stat label="Votes" value={contestant.votes.toLocaleString()} />
                      <Stat label="Followers" value={contestant.followers.toLocaleString()} />
                      <Stat label="Engagement" value={`${contestant.engagementRate.toFixed(1)}%`} />
                      <Stat label="SDS" value={contestant.sds.toFixed(1)} />
                    </div>
                    <p className="mb-3 text-xs text-slate-600">
                      {contestant.location.city}, {contestant.location.country} | Budget from ${contestant.expectedSponsorshipUsd.toLocaleString()} | Available {contestant.availableFrom}
                    </p>

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
