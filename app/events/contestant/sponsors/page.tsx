'use client';

import { ComponentType, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Lock,
  ShieldCheck,
  TrendingUp,
  UserCheck,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  mockContestantActiveCampaign,
  mockContestantOffers,
  mockMarketplaceContestants,
} from '@/lib/sponsorship-mock';

const tierTone: Record<string, string> = {
  A: 'bg-amber-100 text-amber-800',
  B: 'bg-sky-100 text-sky-800',
  C: 'bg-slate-200 text-slate-700',
};

export default function ContestantSponsorsPage() {
  const contestant = mockMarketplaceContestants[0];
  const [offers, setOffers] = useState(mockContestantOffers);

  const pendingOffers = useMemo(() => offers.filter((offer) => offer.status === 'pending'), [offers]);

  const acceptedOffers = useMemo(() => offers.filter((offer) => offer.status === 'accepted'), [offers]);

  const handleAccept = (offerId: string) => {
    setOffers((prev) => prev.map((offer) => (offer.id === offerId ? { ...offer, status: 'accepted' } : offer)));
  };

  const handleReject = (offerId: string) => {
    const confirmReject = window.confirm(
      'Reject this sponsorship offer? This action may affect future sponsor opportunities.'
    );
    if (!confirmReject) return;

    setOffers((prev) => prev.map((offer) => (offer.id === offerId ? { ...offer, status: 'rejected' } : offer)));
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Influence Dashboard</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">Sponsorship Overview</h1>
          <p className="mt-2 text-sm text-slate-600">Sponsorship metrics do not affect voting rank.</p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
            <KpiCard label="SDS" value={contestant.sds.toFixed(1)} />
            <KpiCard label="Trending Status" value={contestant.trendingScore >= 80 ? 'Trending' : 'Normal'} />
            <KpiCard label="Tier Level" value={contestant.tier} />
            <KpiCard label="Integrity Score" value={contestant.integrityScore.toString()} />
            <KpiCard label="7d Vote Growth" value={`${contestant.votes7dGrowth.toFixed(1)}%`} />
            <KpiCard label="7d Follower Growth" value={`${contestant.followers7dGrowth.toFixed(1)}%`} />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Badge className={tierTone[contestant.tier] || tierTone.C}>Tier {contestant.tier}</Badge>
            {contestant.trendingScore >= 80 && <Badge className="bg-red-100 text-red-700">Trending</Badge>}
            {contestant.integrityStatus === 'verified' && (
              <Badge className="bg-emerald-100 text-emerald-800">Verified Integrity</Badge>
            )}
            {contestant.sponsored && <Badge className="bg-blue-100 text-blue-800">Sponsored</Badge>}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Sponsorship Offers</h2>
              <Badge className="bg-slate-100 text-slate-700">{pendingOffers.length} pending</Badge>
            </div>

            <div className="space-y-3">
              {offers.map((offer) => (
                <div key={offer.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{offer.sponsorName}</p>
                      <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                        {offer.trustBadge ? <ShieldCheck className="h-4 w-4 text-emerald-600" /> : <AlertTriangle className="h-4 w-4 text-amber-600" />}
                        <span>{offer.trustBadge ? 'Verified Sponsor' : 'Sponsor flagged'}</span>
                      </div>
                    </div>
                    <Badge
                      className={
                        offer.status === 'accepted'
                          ? 'bg-emerald-100 text-emerald-800'
                          : offer.status === 'rejected'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-blue-100 text-blue-800'
                      }
                    >
                      {offer.status}
                    </Badge>
                  </div>

                  <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
                    <DetailItem label="Duration" value={`${offer.durationDays} days`} />
                    <DetailItem label="Agreed Price" value={`$${offer.agreedPrice.toLocaleString()}`} />
                    <DetailItem label="Deliverables" value={offer.deliverables.join(', ')} />
                  </div>

                  {offer.status === 'pending' && (
                    <div className="mt-4 flex gap-2">
                      <Button type="button" onClick={() => handleAccept(offer.id)} className="flex-1">
                        Accept
                      </Button>
                      <Button type="button" variant="outline" onClick={() => handleReject(offer.id)} className="flex-1">
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Active Campaign</h2>

            {mockContestantActiveCampaign.lockedSocialUsername && (
              <div className="mt-3 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-800">
                <Lock className="mr-2 inline h-4 w-4" />
                Social usernames are locked during active campaign.
              </div>
            )}

            {mockContestantActiveCampaign.paymentState === 'manual_pending' && (
              <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                <Clock3 className="mr-2 inline h-4 w-4" />
                Campaign pending payment. Waiting for manual confirmation.
              </div>
            )}

            {mockContestantActiveCampaign.integrityWarning && (
              <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                <AlertTriangle className="mr-2 inline h-4 w-4" />
                {mockContestantActiveCampaign.integrityWarning}
              </div>
            )}

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <KpiCard label="Sponsor" value={mockContestantActiveCampaign.sponsorName} />
              <KpiCard label="Countdown" value={`${mockContestantActiveCampaign.countdownDays} days`} />
            </div>

            <div className="mt-4 rounded-lg border border-slate-200">
              <div className="border-b border-slate-200 px-4 py-3">
                <p className="font-medium text-slate-900">Deliverables Checklist</p>
              </div>
              <div className="space-y-2 p-4">
                {mockContestantActiveCampaign.deliverables.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                    <p className="text-slate-700">{item.title}</p>
                    <div className="flex items-center gap-2">
                      {item.submitted ? (
                        <Badge className={item.approved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}>
                          {item.approved ? 'Approved' : 'Deliverable rejected'}
                        </Badge>
                      ) : (
                        <Badge className="bg-slate-100 text-slate-700">Pending</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button type="button" className="mt-4 w-full">
              Submit Proof
            </Button>
          </article>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Campaign Safeguards</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <Guardrail icon={UserCheck} text="Reject actions require a confirmation warning." />
            <Guardrail icon={Lock} text="Editing social usernames is disabled during active campaigns." />
            <Guardrail icon={TrendingUp} text="Integrity warnings are displayed when suspicious activity is detected." />
          </div>
        </section>

        {acceptedOffers.length > 0 && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <CheckCircle2 className="mr-2 inline h-4 w-4" />
            {acceptedOffers.length} sponsorship offer(s) accepted and sent for admin mediation.
          </div>
        )}
      </div>
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white px-3 py-2">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm font-medium text-slate-800">{value}</p>
    </div>
  );
}

function Guardrail({
  icon: Icon,
  text,
}: {
  icon: ComponentType<{ className?: string }>;
  text: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700">
      <Icon className="mb-2 h-4 w-4 text-slate-600" />
      {text}
    </div>
  );
}
