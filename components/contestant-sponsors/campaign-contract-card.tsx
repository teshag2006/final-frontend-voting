'use client';

import type { ContestantSponsorContract } from '@/lib/contestant-runtime-store';

export function CampaignContractCard({ contract }: { contract: ContestantSponsorContract | null }) {
  if (!contract) {
    return (
      <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Campaign Contract</h3>
        <p className="mt-2 text-sm text-slate-600">No active contract loaded.</p>
      </article>
    );
  }

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">{contract.title}</h3>
      <p className="text-sm text-slate-600">{contract.sponsorName}</p>
      <div className="mt-3 space-y-2">
        {contract.payoutMilestones.map((item) => (
          <div key={item.name} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
            <p className="font-medium text-slate-900">{item.name}</p>
            <p className="text-slate-700">${item.amountUsd.toLocaleString()} • due in {item.dueInDays} days</p>
            <p className="text-xs text-slate-500">Status: {item.status}</p>
          </div>
        ))}
      </div>
      <ul className="mt-3 list-disc pl-5 text-sm text-slate-700">
        {contract.terms.map((term) => (
          <li key={term}>{term}</li>
        ))}
      </ul>
    </article>
  );
}
