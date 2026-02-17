'use client';

import { BarChart3, DollarSign, AlertTriangle, Globe, Boxes, Zap } from 'lucide-react';
import type { OverviewStats } from '@/types/media';
import { Card } from '@/components/ui/card';

interface OverviewCardsProps {
  stats: OverviewStats;
}

export function OverviewCards({ stats }: OverviewCardsProps) {
  const cards = [
    {
      icon: BarChart3,
      label: 'Total Votes',
      value: stats.totalVotes.toLocaleString(),
      color: 'from-blue-600 to-blue-700',
      textColor: 'text-blue-600',
    },
    {
      icon: DollarSign,
      label: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      color: 'from-emerald-600 to-emerald-700',
      textColor: 'text-emerald-600',
    },
    {
      icon: AlertTriangle,
      label: 'Fraud Flags Today',
      value: stats.fraudFlagsToday,
      color: 'from-red-600 to-red-700',
      textColor: 'text-red-600',
    },
    {
      icon: Globe,
      label: 'Active Countries',
      value: stats.activeCountries,
      color: 'from-purple-600 to-purple-700',
      textColor: 'text-purple-600',
    },
    {
      icon: Boxes,
      label: 'Anchored Batches',
      value: stats.anchoredBatches,
      color: 'from-cyan-600 to-cyan-700',
      textColor: 'text-cyan-600',
    },
    {
      icon: Zap,
      label: 'Live Voting',
      value: stats.eventStatus,
      isStatus: true,
      color: 'from-yellow-600 to-yellow-700',
      textColor: 'text-yellow-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <Card key={idx} className="relative overflow-hidden border-0 bg-slate-950 p-4 shadow-lg">
            {/* Gradient background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-10`} />

            <div className="relative z-10 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className={`rounded-lg ${card.textColor} bg-opacity-10 p-2`}>
                  <Icon className="h-5 w-5" />
                </span>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-400">{card.label}</p>
                <p className="mt-1 text-xl font-bold text-white md:text-2xl">
                  {card.value}
                </p>
              </div>

              {card.isStatus && (
                <div className="mt-1 flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-xs font-medium text-green-400">ACTIVE</span>
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
