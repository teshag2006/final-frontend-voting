'use client';

import { ReactNode, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AlertTriangle, Clock3, Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SponsorLogoutButton } from '@/components/sponsors/sponsor-logout-button';
import { getSponsorCampaignTracking } from '@/lib/api';
import {
  mockMarketplaceContestants,
  mockSponsorCampaignTracking,
  type SponsorCampaignTracking,
} from '@/lib/sponsorship-mock';

const statusTone: Record<string, string> = {
  pending_payment: 'bg-amber-100 text-amber-800',
  active: 'bg-blue-100 text-blue-800',
  completed: 'bg-emerald-100 text-emerald-800',
  under_review: 'bg-red-100 text-red-800',
};

type DeliverableType = 'feed_post' | 'story' | 'reel_video' | 'live_mention';
type DeliverablePlatform = 'Instagram' | 'TikTok' | 'Facebook' | 'Snapchat' | 'X' | 'YouTube';

interface DeliverableRow {
  id: string;
  type: DeliverableType;
  quantity: number;
  platform: DeliverablePlatform;
  dueDate: string;
}

export default function SponsorCampaignTrackingPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const contestantParam = searchParams.get('contestant') || '';
  const lockedContestant =
    mockMarketplaceContestants.find((item) => item.slug === contestantParam) || null;
  const initialContestant =
    lockedContestant?.slug ||
    mockMarketplaceContestants[0]?.slug ||
    '';
  const contestantOptions = lockedContestant ? [lockedContestant] : mockMarketplaceContestants;
  const isContestantLocked = Boolean(lockedContestant);
  const [selectedContestantSlug, setSelectedContestantSlug] = useState(initialContestant);

  const [rows, setRows] = useState<SponsorCampaignTracking[]>(
    selectedContestantSlug
      ? mockSponsorCampaignTracking.filter((item) => item.contestantSlug === selectedContestantSlug)
      : mockSponsorCampaignTracking
  );

  const [campaignTitle, setCampaignTitle] = useState('');
  const [objective, setObjective] = useState<'awareness' | 'conversion' | 'engagement'>('awareness');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [agreedPrice, setAgreedPrice] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [lockAcknowledged, setLockAcknowledged] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [formStatus, setFormStatus] = useState('Draft');

  const [deliverables, setDeliverables] = useState<DeliverableRow[]>([
    { id: 'd-1', type: 'feed_post', quantity: 1, platform: 'Instagram', dueDate: '' },
  ]);

  useEffect(() => {
    let mounted = true;
    getSponsorCampaignTracking(selectedContestantSlug || undefined).then((res) => {
      if (!mounted || !res) return;
      setRows(res);
    });
    return () => {
      mounted = false;
    };
  }, [selectedContestantSlug]);

  useEffect(() => {
    if (!selectedContestantSlug) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('contestant', selectedContestantSlug);
    router.replace(`${pathname}?${params.toString()}`);
  }, [selectedContestantSlug, pathname, router, searchParams]);

  const contestant = useMemo(
    () => mockMarketplaceContestants.find((item) => item.slug === selectedContestantSlug) || null,
    [selectedContestantSlug]
  );

  const durationDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return 0;
    return Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
  }, [startDate, endDate]);

  const totalDeliverables = useMemo(
    () => deliverables.reduce((sum, item) => sum + Math.max(0, item.quantity || 0), 0),
    [deliverables]
  );

  const canSubmit =
    selectedContestantSlug &&
    campaignTitle.trim() &&
    startDate &&
    endDate &&
    Number(agreedPrice) > 0 &&
    deliverables.length > 0 &&
    lockAcknowledged &&
    termsAccepted;

  const addDeliverable = () => {
    setDeliverables((prev) => [
      ...prev,
      {
        id: `d-${Date.now()}`,
        type: 'story',
        quantity: 1,
        platform: 'TikTok',
        dueDate: '',
      },
    ]);
  };

  const removeDeliverable = (id: string) => {
    setDeliverables((prev) => prev.filter((item) => item.id !== id));
  };

  const updateDeliverable = <K extends keyof DeliverableRow>(
    id: string,
    key: K,
    value: DeliverableRow[K]
  ) => {
    setDeliverables((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [key]: value } : item))
    );
  };

  const handleSaveDraft = () => {
    setFormStatus('Draft saved');
  };

  const handleSubmit = () => {
    if (!canSubmit) {
      setFormStatus('Please complete required fields');
      return;
    }
    const confirmed = window.confirm('Submit this sponsorship request for admin review?');
    if (!confirmed) return;
    setFormStatus('Pending Admin Review');
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white lg:-ml-[216px] lg:w-[calc(100%+216px)]">
        <div className="flex items-center justify-between gap-3 px-4 py-5 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs text-slate-500">Sponsor Workspace</p>
            <h1 className="text-2xl font-bold text-slate-900">Campaign Request & Tracking</h1>
          </div>
          <SponsorLogoutButton />
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6 lg:px-8">
        <section className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-900">Create Sponsorship Request</h2>
              <Badge className="bg-slate-100 text-slate-700">{formStatus}</Badge>
            </div>

            <div className="space-y-5">
              <section>
                <h3 className="mb-2 text-sm font-semibold text-slate-900">Campaign Basics</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Contestant (readonly)">
                    <select
                      value={selectedContestantSlug}
                      onChange={(e) => setSelectedContestantSlug(e.target.value)}
                      disabled={isContestantLocked}
                      className="h-10 w-full appearance-none rounded-md border border-slate-300 bg-white px-3 text-sm"
                    >
                      {contestantOptions.map((item) => (
                        <option key={item.slug} value={item.slug}>
                          {item.name} ({item.slug})
                        </option>
                      ))}
                    </select>
                    {isContestantLocked && (
                      <p className="mt-1 text-xs text-slate-500">
                        Contestant is locked to the sponsorship target from the request.
                      </p>
                    )}
                  </Field>
                  <Field label="Campaign Title">
                    <Input value={campaignTitle} onChange={(e) => setCampaignTitle(e.target.value)} placeholder="e.g. Spring Launch Push" />
                  </Field>
                  <Field label="Objective">
                    <select
                      value={objective}
                      onChange={(e) => setObjective(e.target.value as typeof objective)}
                      className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
                    >
                      <option value="awareness">Awareness</option>
                      <option value="conversion">Conversion</option>
                      <option value="engagement">Engagement</option>
                    </select>
                  </Field>
                  <Field label="Duration (auto)">
                    <Input value={durationDays > 0 ? `${durationDays} day(s)` : 'Set start/end'} disabled />
                  </Field>
                  <Field label="Start Date">
                    <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  </Field>
                  <Field label="End Date">
                    <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                  </Field>
                </div>
              </section>

              <section>
                <h3 className="mb-2 text-sm font-semibold text-slate-900">Budget & Payment</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Agreed Price (USD)">
                    <Input
                      type="number"
                      min={0}
                      value={agreedPrice}
                      onChange={(e) => setAgreedPrice(e.target.value)}
                      placeholder="0.00"
                    />
                  </Field>
                  <Field label="Payment Mode">
                    <Input value="Manual Payment" disabled />
                  </Field>
                  <Field label="Payment Reference (optional)">
                    <Input
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                      placeholder="Ref from payment transfer"
                    />
                  </Field>
                  <Field label="Payment Status">
                    <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                      Pending manual confirmation
                    </div>
                  </Field>
                </div>
              </section>

              <section>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">Deliverables</h3>
                  <Button type="button" size="sm" variant="outline" onClick={addDeliverable}>
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    Add Deliverable
                  </Button>
                </div>
                <div className="space-y-3">
                  {deliverables.map((item) => (
                    <div key={item.id} className="grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:grid-cols-5">
                      <select
                        value={item.type}
                        onChange={(e) => updateDeliverable(item.id, 'type', e.target.value as DeliverableType)}
                        className="h-10 rounded-md border border-slate-300 bg-white px-2 text-sm"
                      >
                        <option value="feed_post">Feed post</option>
                        <option value="story">Story</option>
                        <option value="reel_video">Reel/Video</option>
                        <option value="live_mention">Live mention</option>
                      </select>
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => updateDeliverable(item.id, 'quantity', Number(e.target.value || 1))}
                      />
                      <select
                        value={item.platform}
                        onChange={(e) => updateDeliverable(item.id, 'platform', e.target.value as DeliverablePlatform)}
                        className="h-10 rounded-md border border-slate-300 bg-white px-2 text-sm"
                      >
                        <option value="Instagram">Instagram</option>
                        <option value="TikTok">TikTok</option>
                        <option value="Facebook">Facebook</option>
                        <option value="Snapchat">Snapchat</option>
                        <option value="X">X</option>
                        <option value="YouTube">YouTube</option>
                      </select>
                      <Input type="date" value={item.dueDate} onChange={(e) => updateDeliverable(item.id, 'dueDate', e.target.value)} />
                      <Button type="button" variant="outline" onClick={() => removeDeliverable(item.id)} disabled={deliverables.length <= 1}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="mt-2">
                  <label className="mb-1 block text-xs text-slate-500">Special Instructions</label>
                  <textarea
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    className="min-h-20 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                    placeholder="Campaign notes, review criteria, creative constraints"
                  />
                </div>
              </section>

              <section>
                <h3 className="mb-2 text-sm font-semibold text-slate-900">Platform & Compliance</h3>
                <div className="space-y-2 text-sm text-slate-700">
                  <p>Social handles snapshot is readonly during active campaigns.</p>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={lockAcknowledged}
                      onChange={(e) => setLockAcknowledged(e.target.checked)}
                    />
                    I understand social usernames are locked during campaign.
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                    />
                    I accept sponsorship terms and policy conditions.
                  </label>
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <h3 className="mb-2 text-sm font-semibold text-slate-900">Review Summary</h3>
                <div className="grid gap-2 text-sm sm:grid-cols-2">
                  <Summary label="Contestant" value={selectedContestantSlug || 'N/A'} />
                  <Summary label="Duration" value={durationDays > 0 ? `${durationDays} day(s)` : 'N/A'} />
                  <Summary label="Deliverables count" value={totalDeliverables.toString()} />
                  <Summary label="Total Price" value={agreedPrice ? `$${Number(agreedPrice).toLocaleString()}` : '$0'} />
                </div>
              </section>

              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={handleSaveDraft}>
                  Save Draft
                </Button>
                <Button type="button" onClick={handleSubmit} disabled={!canSubmit}>
                  Submit for Admin Review
                </Button>
              </div>
            </div>
          </article>

          <aside className="space-y-4">
            <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">Status Flow</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge className="bg-slate-100 text-slate-700">Draft</Badge>
                <Badge className="bg-blue-100 text-blue-800">Pending Admin Review</Badge>
                <Badge className="bg-amber-100 text-amber-800">Pending Payment (Manual)</Badge>
                <Badge className="bg-indigo-100 text-indigo-800">Active</Badge>
                <Badge className="bg-red-100 text-red-700">Under Review</Badge>
                <Badge className="bg-emerald-100 text-emerald-800">Completed</Badge>
                <Badge className="bg-slate-200 text-slate-800">Rejected</Badge>
              </div>
            </article>

            {contestant ? (
              <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-900">Contestant Quick Stats</h3>
                <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                  <Summary label="SDS" value={contestant.sds.toFixed(1)} />
                  <Summary label="Tier" value={contestant.tier} />
                  <Summary label="Integrity" value={contestant.integrityScore.toString()} />
                  <Summary label="Trending" value={contestant.trendingScore >= 80 ? 'Yes' : 'No'} />
                </div>
                <p className="mt-3 text-xs text-slate-600">
                  Sponsorship metrics do NOT affect voting rank.
                </p>
                {contestant.integrityStatus !== 'verified' && (
                  <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    Integrity warning: contestant is {contestant.integrityStatus.replace('_', ' ')}.
                  </div>
                )}
              </article>
            ) : (
              <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm text-sm text-slate-600">
                Select a contestant from Discover to prefill this request form.
              </article>
            )}

            <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">Recent Campaign History</h3>
              <div className="mt-2 space-y-2">
                {(selectedContestantSlug ? rows.filter((item) => item.contestantSlug === selectedContestantSlug) : rows)
                  .slice(0, 3)
                  .map((row) => (
                    <div key={row.id} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                      <p className="text-sm font-medium text-slate-900">{row.sponsorName}</p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        <Badge className={statusTone[row.campaignStatus]}>{row.campaignStatus.replace('_', ' ')}</Badge>
                        <Badge className={row.paymentStatus === 'pending_manual' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}>
                          {row.paymentStatus === 'pending_manual' ? 'Payment waiting' : row.paymentStatus}
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            </article>
          </aside>
        </section>

        {rows.map((row) => (
          <article key={row.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-slate-900">{row.sponsorName}</p>
                <p className="text-sm text-slate-600">Contestant: {row.contestantSlug}</p>
              </div>
              <div className="flex gap-2">
                <Badge className={statusTone[row.campaignStatus]}>{row.campaignStatus.replace('_', ' ')}</Badge>
                <Badge
                  className={
                    row.paymentStatus === 'pending_manual'
                      ? 'bg-amber-100 text-amber-800'
                      : row.paymentStatus === 'paid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-800'
                  }
                >
                  {row.paymentStatus === 'pending_manual' ? 'Manual payment waiting' : row.paymentStatus}
                </Badge>
              </div>
            </div>

            {row.paymentStatus === 'pending_manual' && (
              <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                <Clock3 className="mr-2 inline h-4 w-4" />
                Campaign pending payment: awaiting admin confirmation.
              </div>
            )}

            {row.campaignStatus === 'under_review' && (
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                <AlertTriangle className="mr-2 inline h-4 w-4" />
                Integrity under review. Performance reporting paused.
              </div>
            )}

            <div className="mb-3 grid gap-3 sm:grid-cols-3">
              <Metric label="Deliverables Submitted" value={`${row.deliverablesSubmitted}/${row.deliverablesTotal}`} />
              <Metric label="Payment Status" value={row.paymentStatus} />
              <Metric label="Admin Notes" value={row.adminNotes} />
            </div>

            {row.performanceSummary ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="mb-2 text-sm font-semibold text-slate-800">Performance Summary</p>
                <div className="grid gap-2 sm:grid-cols-3">
                  <Metric label="Impressions" value={row.performanceSummary.impressions.toLocaleString()} />
                  <Metric label="Clicks" value={row.performanceSummary.clicks.toLocaleString()} />
                  <Metric label="CTR" value={`${row.performanceSummary.ctr.toFixed(2)}%`} />
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Performance summary will appear after campaign completion.</p>
            )}
          </article>
        ))}

        {rows.length === 0 && (
          <article className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
            No campaign history for the selected contestant yet. Submit a new request above to get started.
          </article>
        )}
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs text-slate-500">{label}</label>
      {children}
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white px-3 py-2">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm font-semibold text-slate-900">{value}</p>
    </div>
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
