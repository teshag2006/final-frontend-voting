'use client';

import { Badge } from '@/components/ui/badge';
import type { ContestantSubmissionStatus } from '@/lib/contestant-runtime-store';

export function SubmissionStatusBadge({ status }: { status: ContestantSubmissionStatus }) {
  const tone =
    status === 'approved'
      ? 'bg-emerald-100 text-emerald-800'
      : status === 'submitted' || status === 'under_review'
        ? 'bg-amber-100 text-amber-800'
        : status === 'rejected'
          ? 'bg-rose-100 text-rose-800'
          : 'bg-slate-100 text-slate-700';

  return <Badge className={tone}>{status.replace('_', ' ')}</Badge>;
}
