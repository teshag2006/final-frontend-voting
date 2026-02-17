'use client';

import { TrendingUp, Users, Zap, AlertCircle, CheckCircle, DollarSign } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { SystemMetrics } from '@/types/admin-overview';

interface SystemMetricsProps {
  metrics: SystemMetrics;
}

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
  trend?: number;
  className?: string;
}

function MetricCard({ icon, label, value, subtext, trend, className = '' }: MetricCardProps) {
  return (
    <Card className={`p-6 hover:shadow-lg transition-shadow ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-3xl font-bold text-foreground mt-2">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {subtext && <p className="text-xs text-muted-foreground mt-2">{subtext}</p>}
          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-3">
              <TrendingUp className={`h-4 w-4 ${trend > 0 ? 'text-green-500' : 'text-red-500'}`} />
              <span className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend > 0 ? '+' : ''}{trend}%
              </span>
            </div>
          )}
        </div>
        <div className="flex-shrink-0 p-3 bg-primary/10 rounded-lg">{icon}</div>
      </div>
    </Card>
  );
}

export function SystemMetrics({ metrics }: SystemMetricsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">System Overview</h2>
        <p className="text-muted-foreground mt-1">
          Real-time metrics across all events and voting activities
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <MetricCard
          icon={<Zap className="h-6 w-6 text-blue-500" />}
          label="Active Events"
          value={metrics.activeEvents}
          subtext={`${metrics.activeEvents} events running`}
          trend={12}
        />
        <MetricCard
          icon={<CheckCircle className="h-6 w-6 text-green-500" />}
          label="Total Votes"
          value={metrics.totalVotes.toLocaleString()}
          subtext={`${metrics.paidVotes.toLocaleString()} paid`}
          trend={8}
        />
        <MetricCard
          icon={<DollarSign className="h-6 w-6 text-emerald-500" />}
          label="Revenue"
          value={formatCurrency(metrics.totalRevenue)}
          subtext="All completed transactions"
          trend={15}
        />
        <MetricCard
          icon={<AlertCircle className="h-6 w-6 text-amber-500" />}
          label="Fraud Reports"
          value={metrics.fraudReports}
          subtext="Pending investigation"
          trend={-2}
        />
        <MetricCard
          icon={<CheckCircle className="h-6 w-6 text-purple-500" />}
          label="Blockchain Anchors"
          value={metrics.confirmedAnchors}
          subtext="Confirmed & verified"
          trend={5}
        />
        <MetricCard
          icon={<Users className="h-6 w-6 text-indigo-500" />}
          label="Total Users"
          value={metrics.totalUsers}
          subtext={`${metrics.totalContestants} contestants`}
          trend={18}
        />
      </div>
    </section>
  );
}
