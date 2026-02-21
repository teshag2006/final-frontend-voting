'use client';

import { OverviewStats } from '@/types/media';
import { Users, Vote, TrendingUp, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface OverviewSectionProps {
  stats: OverviewStats;
}

export function OverviewSection({ stats }: OverviewSectionProps) {
  const items = [
    {
      label: 'Total Votes',
      value: stats.totalVotes.toLocaleString(),
      icon: Vote,
      color: 'text-blue-600',
    },
    {
      label: 'Active Contestants',
      value: stats.activeContestants.toString(),
      icon: Users,
      color: 'text-indigo-600',
    },
    {
      label: 'Votes Today',
      value: stats.votesToday.toLocaleString(),
      icon: TrendingUp,
      color: 'text-emerald-600',
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Overview</h2>
      
      <div className="grid gap-4 sm:grid-cols-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label} className="p-4 border-0 bg-white shadow-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Icon className={`w-5 h-5 ${item.color}`} />
                  <p className="text-sm text-gray-600">{item.label}</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">{item.value}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Current Leader Card */}
      <Card className="p-4 border-0 bg-white shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-3">Current Leader</h3>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600" />
          <div>
            <p className="font-medium text-gray-900">Abebe Kebede</p>
            <p className="text-sm text-gray-600">Music Category</p>
          </div>
        </div>
      </Card>

      {/* Event Status Card */}
      <Card className="p-4 border-0 bg-white shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-3">Event Status</h3>
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          <span className="text-lg font-bold text-emerald-600">OPEN</span>
        </div>
      </Card>

      {/* Blockchain Verification Badge */}
      <Card className="p-3 border-0 bg-blue-50 shadow-sm">
        <p className="text-sm text-blue-900 flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-blue-600 rounded-full" />
          Blockchain Anchored: Verified on Ethereum
        </p>
      </Card>
    </div>
  );
}



