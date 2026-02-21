'use client';

import type { ContestantAttributionItem } from '@/lib/contestant-runtime-store';

export function DeliverablePerformanceTable({ data }: { data: ContestantAttributionItem[] }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-lg font-semibold text-slate-800">Deliverable Performance</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="px-2 py-2 font-medium">Deliverable</th>
              <th className="px-2 py-2 font-medium">Impressions</th>
              <th className="px-2 py-2 font-medium">Clicks</th>
              <th className="px-2 py-2 font-medium">Conversions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={`${row.deliverable}-${idx}`} className="border-b border-slate-100">
                <td className="px-2 py-2">{row.deliverable}</td>
                <td className="px-2 py-2">{row.impressions.toLocaleString()}</td>
                <td className="px-2 py-2">{row.clicks.toLocaleString()}</td>
                <td className="px-2 py-2">{row.conversions.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
