'use client';

import type { ContestantProfileVersion } from '@/lib/contestant-runtime-store';

export function ProfileVersionHistory({ versions }: { versions: ContestantProfileVersion[] }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Version History</h3>
      <div className="mt-3 space-y-2">
        {versions.map((item) => (
          <div key={item.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-sm font-semibold text-slate-800">{item.label}</p>
            <p className="text-xs text-slate-500">{new Date(item.at).toLocaleString()}</p>
            <p className="mt-1 text-xs text-slate-600">{item.note}</p>
            <p className="mt-1 text-xs text-slate-500">
              Fields: {item.fieldsUpdated.length > 0 ? item.fieldsUpdated.join(', ') : 'none'}
            </p>
          </div>
        ))}
        {versions.length === 0 ? <p className="text-sm text-slate-500">No profile versions yet.</p> : null}
      </div>
    </section>
  );
}
