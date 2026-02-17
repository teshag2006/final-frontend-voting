'use client';

import { Card } from '@/components/ui/card';
import { DollarSign, CreditCard, TrendingUp } from 'lucide-react';

interface OverviewStats {
  totalVotes: number;
  activeContestants: number;
  votesToday: number;
  totalRevenue?: number;
  avgVotePrice?: number;
  totalTransactions?: number;
}

interface RevenueSnapshotWidgetProps {
  stats: OverviewStats;
}

export function RevenueSnapshotWidget({ stats }: RevenueSnapshotWidgetProps) {
  const revenue = stats.totalRevenue || 124000;
  const transactions = stats.totalTransactions || 58320;
  const avgPrice = stats.avgVotePrice || 2.50;

  const metrics = [
    {
      label: 'Total Revenue',
      value: `$${(revenue / 1000).toFixed(0)}K`,
      icon: DollarSign,
      color: 'text-emerald-600',
    },
    {
      label: 'Total Transactions',
      value: transactions.toLocaleString(),
      icon: CreditCard,
      color: 'text-blue-600',
    },
    {
      label: 'Avg Vote Price',
      value: `$${avgPrice.toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-indigo-600',
    },
  ];

  return (
    <Card className="p-4 border-0 bg-white shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Snapshot</h2>
      
      <div className="space-y-3">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
              <Icon className={`w-4 h-4 ${metric.color} mt-0.5 flex-shrink-0`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-600">{metric.label}</p>
                <p className="text-lg font-bold text-gray-900 mt-0.5">{metric.value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
