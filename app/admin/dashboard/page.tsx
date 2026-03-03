'use client';

import { ComponentType, useEffect, useState } from 'react';
import { AdminHeader } from '@/components/admin/admin-header';
import { SystemMetrics } from '@/components/admin/system-metrics';
import { VoteActivityChart } from '@/components/admin/vote-activity-chart';
import { RevenueAnalytics } from '@/components/admin/revenue-analytics';
import { FraudSummary } from '@/components/admin/fraud-summary';
import { DeviceRiskPanel } from '@/components/admin/device-risk-panel';
import { BlockchainPanel } from '@/components/admin/blockchain-panel';
import { SystemFeed } from '@/components/admin/system-feed';
import { Button } from '@/components/ui/button';
import { ImagePlus, LayoutTemplate, Link2, PanelsTopLeft } from 'lucide-react';
import Link from 'next/link';
import {
  getAdminDashboard,
} from '@/lib/api';
import { authService } from '@/lib/services/authService';

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const token = authService.getToken() || undefined;
      const data = await getAdminDashboard(token);
      setDashboard(data);
    };
    void load();
  }, []);

  const metrics = dashboard?.systemMetrics || {
    activeEvents: 0,
    totalVotes: 0,
    paidVotes: 0,
    totalRevenue: 0,
    fraudReports: 0,
    confirmedAnchors: 0,
    totalUsers: 0,
    totalContestants: 0,
  };
  const voteActivity24h = dashboard?.voteActivity?.day || { range: '24h', data: [] };
  const voteActivity7d = dashboard?.voteActivity?.week || { range: '7d', data: [] };
  const revenue = dashboard?.revenueAnalytics || {
    totalRevenue: 0,
    averageTransaction: 0,
    byProvider: [],
    trend: [],
  };
  const fraudSummary = dashboard?.fraudSummary || {
    total: 0,
    critical: 0,
    high: 0,
    pending: 0,
    resolved: 0,
    criticalPercentage: 0,
    fraudVotesRemoved: 0,
  };
  const fraudAlerts = dashboard?.fraudAlerts || [];
  const deviceRisk = dashboard?.deviceRisk || {
    highRiskDevices: 0,
    botFlaggedDevices: 0,
    averageTrustScore: 0,
    riskDistribution: [],
  };
  const blockchain = dashboard?.blockchainStatus || {
    totalBatches: 0,
    confirmedAnchors: 0,
    pendingAnchors: 0,
    averageTimeToAnchor: 0,
    networkUsed: 'N/A',
    lastAnchorTime: new Date().toISOString(),
  };
  const systemEvents = dashboard?.systemFeed || {
    events: [],
    pagination: { total: 0, hasMore: false },
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <AdminHeader />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Section 1: System Metrics */}
        <SystemMetrics metrics={metrics} />

        {/* Section 1.5: Content Management */}
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Website Content</p>
              <h2 className="text-lg font-semibold text-slate-900">Homepage, Menus, Banners & Sliders</h2>
              <p className="text-sm text-slate-600">
                Insert sponsor banners and sliders, edit homepage content, navigation menus, and footer links.
              </p>
            </div>
            <Button asChild>
              <Link href="/admin/content-management">Open Content CMS</Link>
            </Button>
          </div>
          <div className="grid gap-2 md:grid-cols-4">
            <QuickPill icon={ImagePlus} label="Sponsor Banners" />
            <QuickPill icon={PanelsTopLeft} label="Homepage Sliders" />
            <QuickPill icon={LayoutTemplate} label="Homepage Content" />
            <QuickPill icon={Link2} label="Menus & Footer Links" />
          </div>
        </section>

        {/* Section 2: Vote Activity & Fraud Summary */}
        <div className="grid gap-6 lg:grid-cols-3">
          <VoteActivityChart
            data24h={voteActivity24h}
            data7d={voteActivity7d}
            onRangeChange={(range) => {
              // Handle range change if needed
            }}
          />
          <FraudSummary summary={fraudSummary} alerts={fraudAlerts} />
        </div>

        {/* Section 3: Revenue Analytics */}
        <RevenueAnalytics analytics={revenue} />

        {/* Section 4: Device Risk & Blockchain */}
        <div className="grid gap-6 lg:grid-cols-2">
          <DeviceRiskPanel overview={deviceRisk} />
          <BlockchainPanel status={blockchain} />
        </div>

        {/* Section 5: System Events Feed */}
        <SystemFeed
          data={systemEvents}
          onLoadMore={() => {
            // Page-level load more is handled server-side through /admin/dashboard range endpoint.
          }}
        />
      </main>
    </div>
  );
}

function QuickPill({ icon: Icon, label }: { icon: ComponentType<{ className?: string }>; label: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
      <Icon className="mb-1 h-4 w-4 text-slate-600" />
      {label}
    </div>
  );
}
