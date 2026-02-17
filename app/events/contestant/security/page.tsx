import type { Metadata } from 'next';
import { getSecurityData } from '@/lib/api';
import { mockSecurityData } from '@/lib/dashboard-mock';
import { StatsCard } from '@/components/dashboard/stats-card';
import { Shield, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Trust & Security | Contestant Portal',
  description: 'Security metrics and fraud alerts',
};

const TRUST_LEVEL_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
  Excellent: { bg: 'bg-green-100', text: 'text-green-900', icon: '✓' },
  Good: { bg: 'bg-blue-100', text: 'text-blue-900', icon: '✓' },
  Fair: { bg: 'bg-yellow-100', text: 'text-yellow-900', icon: '⚠' },
  Poor: { bg: 'bg-red-100', text: 'text-red-900', icon: '✕' },
};

const DEVICE_REPUTATION_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Good: { bg: 'bg-green-50', text: 'text-green-900', border: 'border-green-200' },
  Warning: { bg: 'bg-yellow-50', text: 'text-yellow-900', border: 'border-yellow-200' },
  Risky: { bg: 'bg-red-50', text: 'text-red-900', border: 'border-red-200' },
};

export default async function SecurityPage() {
  const apiData = await getSecurityData();
  const data = apiData || mockSecurityData;

  if (!data) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-lg border border-border p-8 text-center">
          <p className="text-muted-foreground">Failed to load security data</p>
        </div>
      </div>
    );
  }

  const { metrics, alerts } = data;
  const trustColor = TRUST_LEVEL_COLORS[metrics.trust_level];
  const deviceColor = DEVICE_REPUTATION_COLORS[metrics.device_reputation];

  return (
    <div className="p-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Trust & Security</h1>
        <p className="text-muted-foreground">Monitor your account security and fraud detection status.</p>
      </div>

      {/* Trust Score Card */}
      <div className={`${trustColor.bg} rounded-lg p-8 border-2 border-current`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Trust Score</p>
            <div className="flex items-baseline gap-3">
              <p className={`text-5xl font-bold ${trustColor.text}`}>{metrics.trust_score}</p>
              <p className={`text-lg font-semibold ${trustColor.text}`}>{metrics.trust_level}</p>
            </div>
          </div>
          <Shield className={`w-16 h-16 ${trustColor.text}`} />
        </div>
      </div>

      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Device Reputation */}
        <div
          className={`${deviceColor.bg} border ${deviceColor.border} rounded-lg p-6`}
        >
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Device Reputation</h3>
          <p className={`text-2xl font-bold ${deviceColor.text}`}>
            {metrics.device_reputation}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {metrics.device_reputation === 'Good'
              ? 'Your device has a clean reputation'
              : metrics.device_reputation === 'Warning'
              ? 'Your device shows some suspicious activity'
              : 'Your device has failed multiple checks'}
          </p>
        </div>

        {/* Fraud Alerts */}
        <StatsCard
          title="Fraud Alerts"
          value={metrics.fraud_alerts_count}
          icon={<AlertCircle className="w-6 h-6 text-yellow-600" />}
          subtext="Active alerts"
        />

        {/* Status */}
        <div className="bg-white rounded-lg border border-border p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Account Status</h3>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-lg font-semibold text-green-600">Active</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Your account is verified and secure</p>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="bg-white rounded-lg border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-6">Recent Alerts</h2>
        
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <p className="text-muted-foreground">No security alerts</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => {
              const statusColor =
                alert.status === 'Resolved'
                  ? 'bg-green-100'
                  : alert.status === 'Reviewed'
                  ? 'bg-blue-100'
                  : alert.status === 'Auto-Blocked'
                  ? 'bg-red-100'
                  : 'bg-yellow-100';

              const statusTextColor =
                alert.status === 'Resolved'
                  ? 'text-green-700'
                  : alert.status === 'Reviewed'
                  ? 'text-blue-700'
                  : alert.status === 'Auto-Blocked'
                  ? 'text-red-700'
                  : 'text-yellow-700';

              return (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-secondary transition-colors"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{alert.alert_type}</p>
                    <p className="text-xs text-muted-foreground mt-1">{alert.date}</p>
                  </div>
                  <span
                    className={`${statusColor} ${statusTextColor} px-3 py-1 rounded-full text-xs font-semibold`}
                  >
                    {alert.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Security Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">Security Best Practices</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>✓ Use strong, unique passwords</li>
            <li>✓ Enable two-factor authentication</li>
            <li>✓ Keep your device software updated</li>
            <li>✓ Don't share your account details</li>
            <li>✓ Report suspicious activity immediately</li>
          </ul>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="font-semibold text-green-900 mb-3">What We Protect</h3>
          <ul className="text-sm text-green-800 space-y-2">
            <li>✓ Blockchain verification for all votes</li>
            <li>✓ Advanced fraud detection</li>
            <li>✓ VPN/Proxy filtering</li>
            <li>✓ Velocity checks</li>
            <li>✓ Device reputation tracking</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
