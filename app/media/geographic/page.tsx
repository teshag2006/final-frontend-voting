import { GeographicDistribution } from '@/components/media/geographic-distribution';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockGeoDistribution } from '@/lib/media-mock';

export const metadata = {
  title: 'Geographic Distribution | Media Dashboard',
  description: 'Vote distribution by geographic region.',
};

export default function MediaGeographicPage() {
  return (
      <main className="space-y-6 px-4 py-8 md:px-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">Geographic Distribution</h1>
          <p className="text-sm text-slate-400">Vote distribution by country (country-level aggregated data only)</p>
        </div>

        {/* Main Geographic Distribution */}
        <section>
          <GeographicDistribution data={mockGeoDistribution} />
        </section>

        {/* Detailed Table */}
        <Card className="border-0 bg-slate-950 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400">Country</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400">Total Votes</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400">Percentage</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400">Unique Devices</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400">Revenue</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {mockGeoDistribution.map((geo, idx) => (
                  <tr
                    key={geo.country}
                    className="border-b border-slate-700 transition-colors hover:bg-slate-900"
                  >
                    <td className="px-6 py-4 font-medium text-white">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🌍</span>
                        {geo.country}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-white">
                      {geo.voteCount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="h-1.5 w-12 rounded-full bg-slate-800">
                          <div
                            className="h-full rounded-full bg-blue-500"
                            style={{ width: `${geo.percentage}%` }}
                          />
                        </div>
                        <span className="w-10 text-right text-sm text-slate-400">
                          {geo.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-slate-400">
                      {geo.uniqueDevices.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-emerald-400">
                      ${geo.revenue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                        Active
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Stats */}
          <div className="border-t border-slate-700 bg-slate-900 px-6 py-4">
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-slate-400 text-xs">Total Votes</p>
                <p className="mt-1 font-semibold text-white">
                  {mockGeoDistribution.reduce((acc, geo) => acc + geo.voteCount, 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Total Revenue</p>
                <p className="mt-1 font-semibold text-white">
                  ${mockGeoDistribution.reduce((acc, geo) => acc + geo.revenue, 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Unique Devices</p>
                <p className="mt-1 font-semibold text-white">
                  {mockGeoDistribution.reduce((acc, geo) => acc + geo.uniqueDevices, 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Countries</p>
                <p className="mt-1 font-semibold text-white">{mockGeoDistribution.length}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Top Regions */}
        <Card className="border-0 bg-slate-950 p-6 shadow-lg">
          <h3 className="mb-6 text-lg font-semibold text-white">Top Performing Regions</h3>
          <div className="space-y-3">
            {mockGeoDistribution.slice(0, 5).map((geo, idx) => {
              const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
              return (
                <div key={geo.country} className="flex items-center justify-between rounded-lg bg-slate-900 p-3">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-lg">{medals[idx]}</span>
                    <div>
                      <p className="font-medium text-white">{geo.country}</p>
                      <p className="text-xs text-slate-400">
                        {geo.voteCount.toLocaleString()} votes • {geo.percentage.toFixed(1)}% of total
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-white">${geo.revenue.toLocaleString()}</p>
                    <p className="text-xs text-slate-400">{geo.uniqueDevices.toLocaleString()} devices</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Info Banner */}
        <div className="rounded-lg border border-blue-700/50 bg-blue-500/10 p-4">
          <p className="text-sm text-blue-300">
            <span className="font-medium">📍 Geographic Data Policy</span>
            <br />
            <span className="text-xs text-blue-200">
              This page displays aggregated, country-level vote distribution only. No city-level data, individual
              geolocations, IP addresses, or other personally identifiable information is exposed. All data is suitable
              for public reporting and media broadcasting.
            </span>
          </p>
        </div>
      </main>
  );
}
