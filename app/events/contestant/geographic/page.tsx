import type { Metadata } from 'next';
import { getGeographicData } from '@/lib/api';
import { mockGeographicData } from '@/lib/dashboard-mock';
import { Shield, AlertTriangle, Globe } from 'lucide-react';
import { AudienceInsightsPanel } from '@/components/dashboard/audience-insights-panel';
import { getContestantAudienceInsights } from '@/lib/contestant-runtime-store';

export const metadata: Metadata = {
  title: 'Geographic Insights | Contestant Portal',
  description: 'Geographic voting distribution and insights',
};

function getCountryFlag(countryCode: string): string {
  const flags: Record<string, string> = {
    ET: 'ET',
    KE: 'KE',
    US: 'US',
    NG: 'NG',
    ZA: 'ZA',
    GH: 'GH',
    EG: 'EG',
  };
  return flags[countryCode] || '--';
}

const COUNTRY_HEATMAP_POINTS: Record<string, { x: number; y: number }> = {
  US: { x: 23, y: 38 },
  NG: { x: 52, y: 54 },
  KE: { x: 58, y: 57 },
  ET: { x: 59, y: 53 },
  ZA: { x: 56, y: 79 },
  GH: { x: 49, y: 55 },
  EG: { x: 56, y: 43 },
};

export default async function GeographicPage() {
  const data = (await getGeographicData()) || mockGeographicData;
  const { countries, vpn_activity } = data;
  const audienceInsights = getContestantAudienceInsights();
  const sortedCountries = [...countries].sort((a, b) => b.votes - a.votes);
  const maxVotes = Math.max(...sortedCountries.map((c) => c.votes), 1);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-slate-800">Geographic Insights</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="relative h-[320px] overflow-hidden rounded-lg border border-slate-200 bg-gradient-to-b from-blue-100 to-blue-300">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg"
              alt="World map"
              className="h-full w-full object-cover opacity-80"
            />

            {sortedCountries.map((country) => {
              const point = COUNTRY_HEATMAP_POINTS[country.country_code];
              if (!point) return null;
              const intensity = country.votes / maxVotes;
              const size = 24 + intensity * 46;
              const alpha = 0.28 + intensity * 0.47;

              return (
                <div
                  key={country.country_code}
                  className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{
                    left: `${point.x}%`,
                    top: `${point.y}%`,
                    width: `${size}px`,
                    height: `${size}px`,
                    background: `radial-gradient(circle, rgba(245, 158, 11, ${alpha}) 0%, rgba(245, 158, 11, 0.18) 55%, rgba(245, 158, 11, 0) 100%)`,
                    boxShadow: `0 0 ${Math.round(size * 0.9)}px rgba(245, 158, 11, ${alpha})`,
                  }}
                  title={`${country.country}: ${country.votes.toLocaleString()} votes`}
                />
              );
            })}

            <div className="absolute bottom-3 right-3 rounded-md bg-white/90 px-3 py-2 text-xs text-slate-700 shadow">
              <p className="mb-1 font-semibold text-slate-800">Heat Intensity</p>
              <div className="h-2 w-28 rounded-full bg-gradient-to-r from-yellow-200 via-amber-400 to-orange-600" />
              <div className="mt-1 flex justify-between">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-slate-700">Country</th>
                  <th className="px-4 py-2 text-left font-semibold text-slate-700">Votes</th>
                  <th className="px-4 py-2 text-left font-semibold text-slate-700">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {sortedCountries.slice(0, 3).map((country) => (
                  <tr key={country.country_code} className="border-t border-slate-200">
                    <td className="px-4 py-2 text-slate-800">{getCountryFlag(country.country_code)} {country.country}</td>
                    <td className="px-4 py-2 text-slate-700">{country.votes.toLocaleString()}</td>
                    <td className="px-4 py-2 text-slate-700">${(country.revenue / 100).toFixed(0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold text-slate-800">Top Voting Countries</h2>
            <div className="space-y-3">
              {sortedCountries.slice(0, 3).map((country) => (
                <div key={country.country_code} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{country.country}</span>
                  <span className="font-semibold text-slate-900">{country.votes.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold text-slate-800">VPN & Proxy Activity</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-slate-700"><Shield className="h-4 w-4 text-emerald-600" /> VPN Votes</span>
                <span className="font-semibold">{vpn_activity.vpn_votes}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-slate-700"><AlertTriangle className="h-4 w-4 text-amber-600" /> Proxy Attempts</span>
                <span className="font-semibold">{vpn_activity.proxy_attempts}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-slate-700"><Globe className="h-4 w-4 text-blue-600" /> TOR Access</span>
                <span className="font-semibold">{vpn_activity.tor_access}</span>
              </div>
            </div>
          </div>

          <AudienceInsightsPanel insights={audienceInsights} />
        </div>
      </div>
    </div>
  );
}
