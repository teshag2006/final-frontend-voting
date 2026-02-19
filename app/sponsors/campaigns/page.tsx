'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AlertTriangle, Clock3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockSponsorCampaignTracking } from '@/lib/sponsorship-mock';

const statusTone: Record<string, string> = {
  pending_payment: 'bg-amber-100 text-amber-800',
  active: 'bg-blue-100 text-blue-800',
  completed: 'bg-emerald-100 text-emerald-800',
  under_review: 'bg-red-100 text-red-800',
};

export default function SponsorCampaignTrackingPage() {
  const searchParams = useSearchParams();
  const contestantFilter = searchParams.get('contestant');
  const rows = contestantFilter
    ? mockSponsorCampaignTracking.filter((item) => item.contestantSlug === contestantFilter)
    : mockSponsorCampaignTracking;

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <p className="text-xs text-slate-500">Sponsor Workspace</p>
          <h1 className="text-2xl font-bold text-slate-900">Campaign Tracking</h1>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6 lg:px-8">
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

        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link href="/sponsors">Back to Discover</Link>
          </Button>
          <Button asChild>
            <Link href="/sponsors">Create New Request</Link>
          </Button>
        </div>
      </main>
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

