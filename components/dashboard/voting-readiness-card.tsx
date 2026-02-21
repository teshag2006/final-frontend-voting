'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { ContestantReadiness } from '@/lib/contestant-runtime-store';

export function VotingReadinessCard({ readiness }: { readiness: ContestantReadiness }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Voting Readiness</h3>
      <p className="mt-1 text-sm text-slate-600">Complete onboarding requirements before your profile goes live.</p>
      <div className="mt-3 h-2 rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-blue-600" style={{ width: `${readiness.score}%` }} />
      </div>
      <p className="mt-2 text-sm font-medium text-slate-800">{readiness.score}% ready</p>
      <ul className="mt-3 space-y-1 text-sm text-slate-700">
        {readiness.checks.map((check) => (
          <li key={check.id}>{check.done ? 'OK' : 'Missing'}: {check.label}</li>
        ))}
      </ul>
      <Button asChild className="mt-3">
        <Link href="/events/contestant/onboarding">Continue Onboarding</Link>
      </Button>
    </article>
  );
}
