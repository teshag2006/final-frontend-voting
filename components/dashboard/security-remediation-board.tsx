'use client';

import { useState } from 'react';
import type { ContestantSecurityCase } from '@/lib/contestant-runtime-store';

export function SecurityRemediationBoard({
  cases: initialCases,
}: {
  cases: ContestantSecurityCase[];
}) {
  const [cases, setCases] = useState<ContestantSecurityCase[]>(initialCases);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function updateCase(caseId: string, action: 'monitor' | 'resolve' | 'reopen') {
    setBusyId(caseId);
    try {
      const res = await fetch(`/api/contestant/security-cases/${caseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) return;
      const updated = (await res.json()) as ContestantSecurityCase;
      setCases((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-slate-800">Risk Remediation Workflow</h2>
      <div className="space-y-3">
        {cases.map((item) => (
          <div key={item.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-slate-900">{item.type}</p>
              <span className="rounded-full border border-slate-300 px-2 py-0.5 text-xs uppercase text-slate-600">
                {item.status}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-600">{item.summary}</p>
            <p className="mt-1 text-xs text-slate-500">Plan: {item.remediationPlan}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busyId === item.id}
                onClick={() => void updateCase(item.id, 'monitor')}
                className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
              >
                Monitor
              </button>
              <button
                type="button"
                disabled={busyId === item.id}
                onClick={() => void updateCase(item.id, 'resolve')}
                className="rounded-md border border-emerald-300 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
              >
                Resolve
              </button>
              <button
                type="button"
                disabled={busyId === item.id}
                onClick={() => void updateCase(item.id, 'reopen')}
                className="rounded-md border border-amber-300 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100 disabled:opacity-50"
              >
                Reopen
              </button>
            </div>
          </div>
        ))}
        {cases.length === 0 ? <p className="text-sm text-slate-500">No risk cases found.</p> : null}
      </div>
    </div>
  );
}
