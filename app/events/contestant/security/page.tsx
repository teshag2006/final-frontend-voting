import type { Metadata } from 'next';
import { getSecurityData } from '@/lib/api';
import { mockSecurityData } from '@/lib/dashboard-mock';

export const metadata: Metadata = {
  title: 'Trust & Security | Contestant Portal',
  description: 'Security metrics and fraud alerts',
};

export default async function SecurityPage() {
  const data = (await getSecurityData()) || mockSecurityData;
  const { metrics, alerts } = data;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-slate-800">Trust & Security</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Tile title="Trust Score" value={`${metrics.trust_score}`} subtitle={metrics.trust_level} strong />
        <Tile title="Device Reputation" value={`${metrics.device_reputation}`} subtitle="Current status" />
        <Tile title="Fraud Alerts" value={`${metrics.fraud_alerts_count}`} subtitle="Cases" warn />
        <Tile title="VPN Detections" value={`${alerts.filter((a: any) => String(a.alert_type).toLowerCase().includes('vpn')).length}`} subtitle="Instances" />
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">Recent Alerts</h2>
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-slate-700">Date</th>
                <th className="px-4 py-2 text-left font-semibold text-slate-700">Alert</th>
                <th className="px-4 py-2 text-left font-semibold text-slate-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert: any) => (
                <tr key={alert.id} className="border-t border-slate-200">
                  <td className="px-4 py-3 text-slate-700">{alert.date}</td>
                  <td className="px-4 py-3 text-slate-800 font-medium">{alert.alert_type}</td>
                  <td className="px-4 py-3 text-slate-700">{alert.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Tile({
  title,
  value,
  subtitle,
  strong = false,
  warn = false,
}: {
  title: string;
  value: string;
  subtitle: string;
  strong?: boolean;
  warn?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-4 shadow-sm ${strong ? 'bg-blue-700 border-blue-700 text-white' : 'bg-white border-slate-200'} ${warn ? 'bg-amber-50' : ''}`}>
      <p className={`text-sm ${strong ? 'text-blue-100' : 'text-slate-500'}`}>{title}</p>
      <p className={`mt-2 text-3xl font-semibold ${strong ? 'text-white' : 'text-slate-900'}`}>{value}</p>
      <p className={`text-sm mt-1 ${strong ? 'text-blue-100' : 'text-slate-600'}`}>{subtitle}</p>
    </div>
  );
}
