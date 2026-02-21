'use client';

import type { ContestantAudienceInsight } from '@/lib/contestant-runtime-store';

export function AudienceInsightsPanel({ insights }: { insights: ContestantAudienceInsight[] }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-slate-800">Audience Insights</h2>
      <div className="space-y-3">
        {insights.map((item) => {
          const tone =
            item.priority === 'high'
              ? 'text-red-600 bg-red-50 border-red-200'
              : item.priority === 'medium'
              ? 'text-amber-700 bg-amber-50 border-amber-200'
              : 'text-emerald-700 bg-emerald-50 border-emerald-200';

          return (
            <div key={item.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <div>
                <p className="text-sm font-semibold text-slate-800">{item.segment}</p>
                <p className="text-xs text-slate-500">{item.value}</p>
              </div>
              <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${tone}`}>
                {item.deltaPct > 0 ? '+' : ''}
                {item.deltaPct.toFixed(1)}%
              </span>
            </div>
          );
        })}
        {insights.length === 0 ? <p className="text-sm text-slate-500">No audience insights available yet.</p> : null}
      </div>
    </div>
  );
}
