import type { Metadata } from 'next';
import { getGeographicData } from '@/lib/api';
import { mockGeographicData } from '@/lib/dashboard-mock';
import { Globe, Shield, AlertCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Geographic Insights | Contestant Portal',
  description: 'Geographic voting distribution and insights',
};

function getCountryFlag(countryCode: string): string {
  const flags: Record<string, string> = {
    ET: '🇪🇹',
    KE: '🇰🇪',
    US: '🇺🇸',
    NG: '🇳🇬',
    ZA: '🇿🇦',
    GH: '🇬🇭',
    EG: '🇪🇬',
  };
  return flags[countryCode] || '🌍';
}

export default async function GeographicPage() {
  const apiData = await getGeographicData();
  const data = apiData || mockGeographicData;

  const { countries, vpn_activity } = data;
  const sortedCountries = [...countries].sort((a, b) => b.votes - a.votes);
  const totalVotes = countries.reduce((sum, c) => sum + c.votes, 0);
  const totalRevenue = countries.reduce((sum, c) => sum + c.revenue, 0);

  return (
    <div className="p-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Geographic Insights</h1>
        <p className="text-muted-foreground">Analyze voting patterns across countries and regions.</p>
      </div>

      {/* VPN & Proxy Activity */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">VPN Votes</h3>
            <Shield className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-3xl font-bold text-foreground">{vpn_activity.vpn_votes}</p>
          <p className="text-xs text-muted-foreground mt-2">Filtered votes</p>
        </div>

        <div className="bg-white rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Proxy Attempts</h3>
            <AlertCircle className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-3xl font-bold text-foreground">{vpn_activity.proxy_attempts}</p>
          <p className="text-xs text-muted-foreground mt-2">Blocked</p>
        </div>

        <div className="bg-white rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">TOR Access</h3>
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-foreground">{vpn_activity.tor_access}</p>
          <p className="text-xs text-muted-foreground mt-2">Flagged</p>
        </div>
      </div>

      {/* Top Countries Table */}
      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Top Voting Countries</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Country</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Votes</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">% of Total</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {sortedCountries.map((country, index) => (
                <tr
                  key={country.country_code}
                  className="border-b border-border hover:bg-secondary/50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-medium text-foreground">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getCountryFlag(country.country_code)}</span>
                      {country.country}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    {country.votes.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    {((country.votes / totalVotes) * 100).toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    ${(country.revenue / 100).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-border p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Countries</h3>
          <p className="text-3xl font-bold text-foreground">{countries.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-border p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Votes</h3>
          <p className="text-3xl font-bold text-foreground">{totalVotes.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg border border-border p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold text-foreground">${(totalRevenue / 100).toFixed(2)}</p>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <Globe className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Geographic Distribution</h3>
            <p className="text-sm text-blue-800">
              This data shows your voting distribution across countries. VPN, Proxy, and TOR votes are
              filtered based on our fraud detection system to ensure voting integrity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
