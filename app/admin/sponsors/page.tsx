'use client';

import { ComponentType, ReactNode, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Flame,
  Gavel,
  ShieldAlert,
  ShieldCheck,
  Wallet,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  getAdminSponsorshipInsights,
  getAdminSponsorshipRegistry,
} from '@/lib/sponsorship-data';
import type { Sponsor } from '@/types/contestant';

type EnforcementAction = 'apply_penalty' | 'reduce_integrity' | 'suspend_sponsorship' | 'downgrade_tier';

const actionLabels: Record<EnforcementAction, string> = {
  apply_penalty: 'Apply penalty',
  reduce_integrity: 'Reduce integrity score',
  suspend_sponsorship: 'Suspend sponsorship eligibility',
  downgrade_tier: 'Downgrade tier',
};

export default function AdminSponsorsPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [isSponsorsLoading, setIsSponsorsLoading] = useState(true);
  const [marketplaceContestants, setMarketplaceContestants] = useState<any[]>([]);
  const [adminRevenueSeries, setAdminRevenueSeries] = useState<Array<{ month: string; revenue: number; commission: number }>>([]);
  const [integritySignals, setIntegritySignals] = useState<{
    voteSpikes: Array<{ time: string; value: number }>;
    followerSpikes: Array<{ time: string; value: number }>;
    flaggedContestants: Array<{ slug: string; severity: string; reason: string }>;
    penaltyHistory: Array<{ date: string; contestant: string; action: string }>;
  }>({
    voteSpikes: [],
    followerSpikes: [],
    flaggedContestants: [],
    penaltyHistory: [],
  });
  const [sponsorSearch, setSponsorSearch] = useState('');
  const [logRows, setLogRows] = useState([
    { at: '2026-02-18 11:22', action: 'Apply penalty', target: 'Yonas H', note: 'Vote anomaly confirmation' },
    { at: '2026-02-18 09:15', action: 'Reduce integrity score', target: 'Abeba T', note: 'Follower burst threshold breach' },
  ]);

  const topSds = useMemo(
    () => [...marketplaceContestants].sort((a, b) => Number(b.sds || 0) - Number(a.sds || 0)).slice(0, 3),
    [marketplaceContestants]
  );
  const topTrending = useMemo(
    () => [...marketplaceContestants].sort((a, b) => Number(b.trendingScore || 0) - Number(a.trendingScore || 0)).slice(0, 3),
    [marketplaceContestants]
  );

  const integrityAlerts = marketplaceContestants.filter((c) => c.integrityStatus !== 'verified').length;
  const tierDistribution = useMemo(() => {
    const counts = { A: 0, B: 0, C: 0 };
    for (const row of marketplaceContestants) {
      const tier = String(row.tier || 'C') as 'A' | 'B' | 'C';
      counts[tier] += 1;
    }
    return counts;
  }, [marketplaceContestants]);

  const totalRevenue = adminRevenueSeries.reduce((acc, row) => acc + row.revenue, 0);
  const commissionTotal = adminRevenueSeries.reduce((acc, row) => acc + row.commission, 0);

  const revenueByTier = useMemo(() => {
    return {
      A: 46200,
      B: 21900,
      C: 11800,
    };
  }, []);

  const revenueByCategory = useMemo(() => {
    return {
      Singing: 26100,
      Sports: 21400,
      Acting: 18500,
      Dancing: 13900,
    };
  }, []);

  const filteredSponsors = useMemo(() => {
    const q = sponsorSearch.trim().toLowerCase();
    if (!q) return sponsors;
    return sponsors.filter((row) => (row.name || '').toLowerCase().includes(q));
  }, [sponsors, sponsorSearch]);

  useEffect(() => {
    const loadSponsors = async () => {
      setIsSponsorsLoading(true);
      try {
        const [{ sponsors: sponsorRows, campaigns }, insights] = await Promise.all([
          getAdminSponsorshipRegistry(),
          getAdminSponsorshipInsights(),
        ]);

        setSponsors(Array.isArray(sponsorRows) ? (sponsorRows as Sponsor[]) : []);
        const contestants = Array.isArray(insights.contestants) ? insights.contestants : [];
        setMarketplaceContestants(contestants);

        const monthly = new Map<string, { revenue: number; commission: number }>();
        for (const row of Array.isArray(campaigns) ? campaigns : []) {
          const month = String(row.month || row.created_at || new Date().toISOString()).slice(0, 7);
          const current = monthly.get(month) || { revenue: 0, commission: 0 };
          const spend = Number(row.budget || row.spend || 0);
          current.revenue += spend;
          current.commission += spend * 0.1;
          monthly.set(month, current);
        }
        setAdminRevenueSeries(
          Array.from(monthly.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([month, value]) => ({ month, ...value }))
        );

        setIntegritySignals({
          voteSpikes: contestants.slice(0, 6).map((row: any, index: number) => ({
            time: `T${index + 1}`,
            value: Number(row.votes7dGrowth || 0),
          })),
          followerSpikes: contestants.slice(0, 6).map((row: any, index: number) => ({
            time: `T${index + 1}`,
            value: Number(row.followers7dGrowth || 0),
          })),
          flaggedContestants: contestants
            .filter((row: any) => row.integrityStatus && row.integrityStatus !== 'verified')
            .slice(0, 10)
            .map((row: any) => ({
              slug: String(row.slug || row.id || 'unknown'),
              severity: Number(row.integrityScore || 0) < 50 ? 'high' : 'medium',
              reason: 'Integrity risk threshold triggered',
            })),
          penaltyHistory: (Array.isArray(insights.tracking) ? insights.tracking : [])
            .slice(0, 10)
            .map((row: any) => ({
              date: String(row.updated_at || row.created_at || new Date().toISOString()).slice(0, 10),
              contestant: String(row.contestantSlug || row.contestant || 'unknown'),
              action: String(row.adminNotes || row.campaignStatus || 'review'),
            })),
        });
      } finally {
        setIsSponsorsLoading(false);
      }
    };
    void loadSponsors();
  }, []);

  const handleEnforcement = (target: string, action: EnforcementAction) => {
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
    setLogRows((prev) => [
      {
        at: now,
        action: actionLabels[action],
        target,
        note: 'Queued by admin control panel',
      },
      ...prev,
    ]);
  };

  const patchSponsor = async (id: string, patch: Partial<Sponsor>) => {
    const response = await fetch('/api/admin/sponsors', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, patch }),
    });
    return response.ok;
  };

  const handleApproveSponsor = async (sponsor: Sponsor) => {
    if (!sponsor.id) return;
    if (!window.confirm(`Approve sponsor "${sponsor.name}"?`)) return;
    const previous = { ...sponsor };
    setSponsors((prev) =>
      prev.map((row) =>
        row.id === sponsor.id ? { ...row, approved: true, status: 'active' } : row
      )
    );
    const ok = await patchSponsor(sponsor.id, { approved: true, status: 'active' });
    if (!ok) {
      setSponsors((prev) => prev.map((row) => (row.id === sponsor.id ? previous : row)));
      window.alert('Could not approve sponsor.');
    }
  };

  const handleRejectSponsor = async (sponsor: Sponsor) => {
    if (!sponsor.id) return;
    if (!window.confirm(`Reject sponsor "${sponsor.name}"?`)) return;
    const previous = { ...sponsor };
    setSponsors((prev) =>
      prev.map((row) =>
        row.id === sponsor.id ? { ...row, approved: false, status: 'draft' } : row
      )
    );
    const ok = await patchSponsor(sponsor.id, { approved: false, status: 'draft' });
    if (!ok) {
      setSponsors((prev) => prev.map((row) => (row.id === sponsor.id ? previous : row)));
      window.alert('Could not reject sponsor.');
    }
  };

  const handleDisableSponsor = async (sponsor: Sponsor) => {
    if (!sponsor.id) return;
    if (!window.confirm(`Disable sponsor "${sponsor.name}"?`)) return;
    const previous = { ...sponsor };
    setSponsors((prev) =>
      prev.map((row) =>
        row.id === sponsor.id ? { ...row, approved: false, status: 'paused' } : row
      )
    );
    const ok = await patchSponsor(sponsor.id, { approved: false, status: 'paused' });
    if (!ok) {
      setSponsors((prev) => prev.map((row) => (row.id === sponsor.id ? previous : row)));
      window.alert('Could not disable sponsor.');
    }
  };

  const handleLoginAsSponsor = async (sponsor: Sponsor) => {
    if (!sponsor.id) return;
    const confirmed = window.confirm(
      `Sign in as sponsor "${sponsor.name}"? You will switch to sponsor dashboard.`
    );
    if (!confirmed) return;

    try {
      const response = await fetch('/api/admin/sponsors/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          sponsorId: sponsor.id,
          name: sponsor.name,
          avatar: sponsor.logo_url || sponsor.logoUrl,
        }),
      });

      if (!response.ok) {
        window.alert('Could not start sponsor login. Please try again.');
        return;
      }

      const payload = (await response.json()) as {
        access_token?: string;
        refresh_token?: string;
        user?: { id: string; email: string; name: string; role: 'sponsor'; avatar?: string };
      };
      if (!payload.user) {
        window.alert('Sponsor session data is missing.');
        return;
      }

      localStorage.setItem('auth_user_id', payload.user.id);
      localStorage.setItem('auth_user_role', payload.user.role);
      localStorage.setItem('auth_impersonation_user', JSON.stringify(payload.user));
      if (payload.access_token) {
        localStorage.setItem('auth_token', payload.access_token);
      }
      if (payload.refresh_token) {
        localStorage.setItem('refresh_token', payload.refresh_token);
      }

      window.location.href = '/sponsors';
    } catch {
      window.alert('Could not start sponsor login. Please try again.');
    }
  };

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Sponsorship & Influence Marketplace</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">Admin-Mediated Control Panel</h1>
        <p className="mt-2 text-sm text-slate-600">
          Badges and sponsorship metrics do not affect leaderboard visuals or voting rank.
        </p>
      </section>

      <Tabs defaultValue="registry" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="registry">Registry</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="enforcement">Enforcement</TabsTrigger>
          <TabsTrigger value="notes">System Notes</TabsTrigger>
        </TabsList>

      <TabsContent value="registry" className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Sponsor Registry</h2>
            <p className="text-sm text-slate-600">
              Manage sponsors the same way as contestant moderation: approve, reject, or disable.
            </p>
          </div>
          <div className="w-full sm:w-80">
            <Input
              value={sponsorSearch}
              onChange={(event) => setSponsorSearch(event.target.value)}
              placeholder="Search sponsor name"
              aria-label="Search sponsors"
            />
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Sponsor ID</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Approved</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Status</th>
                    <th className="px-4 py-3 text-center font-semibold text-slate-700">Sign In</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isSponsorsLoading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                        Loading sponsors...
                      </td>
                    </tr>
                  ) : filteredSponsors.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                        No sponsors found.
                      </td>
                    </tr>
                  ) : (
                filteredSponsors.map((sponsor) => (
                  <tr key={sponsor.id || sponsor.name} className="border-b border-slate-100">
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{sponsor.id || '-'}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{sponsor.name}</td>
                    <td className="px-4 py-3">
                      <Badge className={sponsor.approved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}>
                        {sponsor.approved ? 'Yes' : 'No'}
                      </Badge>
                    </td>
                        <td className="px-4 py-3">
                          <Badge className="bg-slate-100 text-slate-700">
                            {sponsor.status || 'draft'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => void handleLoginAsSponsor(sponsor)}
                          >
                            Sign In
                          </Button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" onClick={() => void handleApproveSponsor(sponsor)}>
                              Approve
                            </Button>
                        <Button size="sm" variant="outline" onClick={() => void handleRejectSponsor(sponsor)}>
                          Reject
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => void handleDisableSponsor(sponsor)}>
                          Disable
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
      </TabsContent>

      <TabsContent value="insights" className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-4">
        <Panel title="Top SDS" icon={BarChart3}>
          <div className="space-y-2">
            {topSds.map((item) => (
              <Row key={item.slug} left={item.name} right={item.sds.toFixed(1)} />
            ))}
          </div>
        </Panel>

        <Panel title="Top Trending" icon={Flame}>
          <div className="space-y-2">
            {topTrending.map((item) => (
              <Row key={item.slug} left={item.name} right={item.trendingScore.toString()} />
            ))}
          </div>
        </Panel>

        <Panel title="Integrity Alerts" icon={ShieldAlert}>
          <p className="text-3xl font-semibold text-red-700">{integrityAlerts}</p>
          <p className="mt-1 text-sm text-slate-600">Contestants under review or flagged.</p>
        </Panel>

        <Panel title="Tier Distribution" icon={ShieldCheck}>
          <div className="space-y-2 text-sm">
            <Row left="Tier A" right={tierDistribution.A.toString()} />
            <Row left="Tier B" right={tierDistribution.B.toString()} />
            <Row left="Tier C" right={tierDistribution.C.toString()} />
          </div>
        </Panel>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Wallet className="h-4 w-4 text-slate-700" />
            <h2 className="text-lg font-semibold text-slate-900">Revenue Dashboard</h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Metric label="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} />
            <Metric label="Commission Total" value={`$${commissionTotal.toLocaleString()}`} />
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-700">Monthly Graph (cached values)</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {adminRevenueSeries.map((row) => (
                <div key={row.month} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs">
                  <p className="text-slate-500">{row.month}</p>
                  <p className="font-semibold text-slate-900">Rev: ${row.revenue.toLocaleString()}</p>
                  <p className="text-slate-700">Comm: ${row.commission.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 p-3">
              <p className="text-sm font-medium text-slate-700">Revenue by Tier</p>
              <div className="mt-2 space-y-1 text-sm">
                <Row left="Tier A" right={`$${revenueByTier.A.toLocaleString()}`} />
                <Row left="Tier B" right={`$${revenueByTier.B.toLocaleString()}`} />
                <Row left="Tier C" right={`$${revenueByTier.C.toLocaleString()}`} />
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 p-3">
              <p className="text-sm font-medium text-slate-700">Revenue by Category</p>
              <div className="mt-2 space-y-1 text-sm">
                <Row left="Singing" right={`$${revenueByCategory.Singing.toLocaleString()}`} />
                <Row left="Sports" right={`$${revenueByCategory.Sports.toLocaleString()}`} />
                <Row left="Acting" right={`$${revenueByCategory.Acting.toLocaleString()}`} />
                <Row left="Dancing" right={`$${revenueByCategory.Dancing.toLocaleString()}`} />
              </div>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Integrity Monitor</h2>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-sm font-medium text-slate-700">Vote Spike Graph (lightweight)</p>
            <div className="mt-2 space-y-1 text-xs">
              {integritySignals.voteSpikes.map((row) => (
                <Row key={`vote-${row.time}`} left={row.time} right={row.value.toString()} />
              ))}
            </div>
          </div>

          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-sm font-medium text-slate-700">Follower Spike Graph (lightweight)</p>
            <div className="mt-2 space-y-1 text-xs">
              {integritySignals.followerSpikes.map((row) => (
                <Row key={`follow-${row.time}`} left={row.time} right={row.value.toString()} />
              ))}
            </div>
          </div>

          <div className="mt-3 rounded-xl border border-slate-200 p-3">
            <p className="text-sm font-medium text-slate-700">Flagged Contestants</p>
            <div className="mt-2 space-y-2 text-sm">
              {integritySignals.flaggedContestants.map((row) => (
                <div key={row.slug} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-slate-900">{row.slug}</p>
                    <Badge className={row.severity === 'high' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'}>
                      {row.severity}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-slate-600">{row.reason}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 rounded-xl border border-slate-200 p-3">
            <p className="text-sm font-medium text-slate-700">Penalty History</p>
            <div className="mt-2 space-y-1 text-xs">
              {integritySignals.penaltyHistory.map((row) => (
                <Row key={`${row.date}-${row.contestant}`} left={`${row.date} - ${row.contestant}`} right={row.action} />
              ))}
            </div>
          </div>
        </article>
      </section>
      </TabsContent>

      <TabsContent value="enforcement" className="space-y-4">
      <section className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Gavel className="h-4 w-4 text-slate-700" />
            <h2 className="text-lg font-semibold text-slate-900">Enforcement Panel</h2>
          </div>

          <div className="space-y-3">
            {marketplaceContestants.map((contestant) => (
              <div key={contestant.slug} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-900">{contestant.name}</p>
                    <p className="text-xs text-slate-600">{contestant.slug}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-slate-100 text-slate-700">Tier {contestant.tier}</Badge>
                    {contestant.integrityStatus === 'verified' && (
                      <Badge className="bg-emerald-100 text-emerald-800">Verified Integrity</Badge>
                    )}
                    {contestant.integrityStatus === 'under_review' && (
                      <Badge className="bg-amber-100 text-amber-800">Under Review</Badge>
                    )}
                    {contestant.integrityStatus === 'flagged' && (
                      <Badge className="bg-red-100 text-red-700">Integrity under review</Badge>
                    )}
                  </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <Button type="button" variant="outline" onClick={() => handleEnforcement(contestant.name, 'apply_penalty')}>
                    Apply Penalty
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleEnforcement(contestant.name, 'reduce_integrity')}
                  >
                    Reduce Integrity
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleEnforcement(contestant.name, 'suspend_sponsorship')}
                  >
                    Suspend Sponsorship
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleEnforcement(contestant.name, 'downgrade_tier')}
                  >
                    Downgrade Tier
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Enforcement Log</h2>
          <p className="mt-1 text-sm text-slate-600">All admin actions are logged.</p>

          <div className="mt-4 space-y-2">
            {logRows.map((row, idx) => (
              <div key={`${row.at}-${idx}`} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-xs text-slate-500">{row.at}</p>
                <p className="text-sm font-medium text-slate-900">{row.action}</p>
                <p className="text-xs text-slate-700">
                  Target: {row.target} | Note: {row.note}
                </p>
              </div>
            ))}
          </div>
        </article>
      </section>
      </TabsContent>

      <TabsContent value="notes" className="space-y-4">
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">Error States</h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          <StateBadge text="Integrity under review" tone="warn" />
          <StateBadge text="Campaign pending payment" tone="warn" />
          <StateBadge text="Deliverable rejected" tone="error" />
          <StateBadge text="Sponsor flagged" tone="error" />
          <StateBadge text="Tier downgraded" tone="neutral" />
        </div>
      </section>

      <section className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        <CheckCircle2 className="mr-2 inline h-4 w-4" />
        Cached SDS and trending signals are displayed for performance; heavy charts are intentionally lightweight.
      </section>

      <section className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <AlertTriangle className="mr-2 inline h-4 w-4" />
        External sponsor links must open in a new tab across sponsor-facing pages.
      </section>
      </TabsContent>
      </Tabs>
    </main>
  );
}

function Panel({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: ComponentType<{ className?: string }>;
  children: ReactNode;
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-slate-700" />
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      </div>
      {children}
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function Row({ left, right }: { left: string; right: string }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-2 py-1">
      <span className="text-slate-700">{left}</span>
      <span className="font-medium text-slate-900">{right}</span>
    </div>
  );
}

function StateBadge({
  text,
  tone,
}: {
  text: string;
  tone: 'warn' | 'error' | 'neutral';
}) {
  const className =
    tone === 'warn'
      ? 'bg-amber-100 text-amber-800'
      : tone === 'error'
        ? 'bg-red-100 text-red-700'
        : 'bg-slate-100 text-slate-700';

  return <Badge className={className}>{text}</Badge>;
}


