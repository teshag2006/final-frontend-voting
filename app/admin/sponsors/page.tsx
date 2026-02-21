'use client';

import { ComponentType, ReactNode, useMemo, useState } from 'react';
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
import {
  mockAdminRevenueSeries,
  mockIntegritySignals,
  mockMarketplaceContestants,
} from '@/lib/sponsorship-mock';

type EnforcementAction = 'apply_penalty' | 'reduce_integrity' | 'suspend_sponsorship' | 'downgrade_tier';

const actionLabels: Record<EnforcementAction, string> = {
  apply_penalty: 'Apply penalty',
  reduce_integrity: 'Reduce integrity score',
  suspend_sponsorship: 'Suspend sponsorship eligibility',
  downgrade_tier: 'Downgrade tier',
};

export default function AdminSponsorsPage() {
  const [logRows, setLogRows] = useState([
    { at: '2026-02-18 11:22', action: 'Apply penalty', target: 'Yonas H', note: 'Vote anomaly confirmation' },
    { at: '2026-02-18 09:15', action: 'Reduce integrity score', target: 'Abeba T', note: 'Follower burst threshold breach' },
  ]);

  const topSds = useMemo(
    () => [...mockMarketplaceContestants].sort((a, b) => b.sds - a.sds).slice(0, 3),
    []
  );
  const topTrending = useMemo(
    () => [...mockMarketplaceContestants].sort((a, b) => b.trendingScore - a.trendingScore).slice(0, 3),
    []
  );

  const integrityAlerts = mockMarketplaceContestants.filter((c) => c.integrityStatus !== 'verified').length;
  const tierDistribution = useMemo(() => {
    const counts = { A: 0, B: 0, C: 0 };
    for (const row of mockMarketplaceContestants) counts[row.tier] += 1;
    return counts;
  }, []);

  const totalRevenue = mockAdminRevenueSeries.reduce((acc, row) => acc + row.revenue, 0);
  const commissionTotal = mockAdminRevenueSeries.reduce((acc, row) => acc + row.commission, 0);

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

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Sponsorship & Influence Marketplace</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">Admin-Mediated Control Panel</h1>
        <p className="mt-2 text-sm text-slate-600">
          Badges and sponsorship metrics do not affect leaderboard visuals or voting rank.
        </p>
      </section>

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
              {mockAdminRevenueSeries.map((row) => (
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
              {mockIntegritySignals.voteSpikes.map((row) => (
                <Row key={`vote-${row.time}`} left={row.time} right={row.value.toString()} />
              ))}
            </div>
          </div>

          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-sm font-medium text-slate-700">Follower Spike Graph (lightweight)</p>
            <div className="mt-2 space-y-1 text-xs">
              {mockIntegritySignals.followerSpikes.map((row) => (
                <Row key={`follow-${row.time}`} left={row.time} right={row.value.toString()} />
              ))}
            </div>
          </div>

          <div className="mt-3 rounded-xl border border-slate-200 p-3">
            <p className="text-sm font-medium text-slate-700">Flagged Contestants</p>
            <div className="mt-2 space-y-2 text-sm">
              {mockIntegritySignals.flaggedContestants.map((row) => (
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
              {mockIntegritySignals.penaltyHistory.map((row) => (
                <Row key={`${row.date}-${row.contestant}`} left={`${row.date} - ${row.contestant}`} right={row.action} />
              ))}
            </div>
          </div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Gavel className="h-4 w-4 text-slate-700" />
            <h2 className="text-lg font-semibold text-slate-900">Enforcement Panel</h2>
          </div>

          <div className="space-y-3">
            {mockMarketplaceContestants.map((contestant) => (
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

