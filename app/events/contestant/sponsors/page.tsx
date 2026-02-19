import type { Metadata } from 'next';
import { getSponsorsData } from '@/lib/api';
import { mockSponsorsData } from '@/lib/dashboard-mock';

export const metadata: Metadata = {
  title: 'Sponsors | Contestant Portal',
  description: 'Track sponsor visibility and engagement',
};

export default async function SponsorsPage() {
  const sponsors = ((await getSponsorsData()) || mockSponsorsData).filter(
    (sponsor) => sponsor.approved !== false && sponsor.placement_status !== 'ended'
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-slate-800">Sponsors</h1>
      </div>

      {sponsors.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-slate-600 shadow-sm">No sponsor placements available.</div>
      ) : (
        <div className="space-y-4">
          {sponsors.map((sponsor, index) => (
            <div key={`${sponsor.sponsor_name}-${index}`} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">{sponsor.sponsor_name}</h2>
                  <p className="text-sm text-slate-500">
                    {sponsor.campaign_period} • {sponsor.placement_slot || 'profile'}
                  </p>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {sponsor.approved === false ? 'Pending' : 'Approved'}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <Stat label="Impressions" value={sponsor.impressions.toLocaleString()} />
                <Stat label="Engagement" value={sponsor.engagement_metrics.toLocaleString()} />
                <Stat label="CTR" value={`${Number(sponsor.click_through_rate || 0).toFixed(2)}%`} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}
