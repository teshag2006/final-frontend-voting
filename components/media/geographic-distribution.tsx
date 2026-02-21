'use client';

import { Card } from '@/components/ui/card';

interface GeoItem {
  country: string;
  voteCount: number;
  uniqueDevices: number;
  revenue: number;
  percentage: number;
}

interface GeographicDistributionProps {
  data: GeoItem[];
}

export function GeographicDistribution({ data }: GeographicDistributionProps) {
  const maxVotes = Math.max(...data.map((d) => d.voteCount), 1);

  return (
    <Card className="border-0 bg-slate-900 p-6">
      <h2 className="mb-4 text-lg font-semibold text-white">Votes By Country</h2>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={`${item.country}-${item.voteCount}-${index}`}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-slate-200">{item.country}</span>
              <span className="text-slate-400">{item.voteCount.toLocaleString()} votes</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-blue-500"
                style={{ width: `${(item.voteCount / maxVotes) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
