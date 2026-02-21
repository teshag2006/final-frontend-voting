'use client';

import { Badge } from '@/components/ui/badge';
import { DeliverableProofForm } from '@/components/contestant-sponsors/deliverable-proof-form';
import type { ContestantDeliverableItem } from '@/lib/contestant-runtime-store';

export function DeliverablesBoard({
  items,
  onSubmitProof,
}: {
  items: ContestantDeliverableItem[];
  onSubmitProof: (payload: { deliverableId: string; proofUrl: string }) => Promise<void>;
}) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id} className="rounded-md border border-slate-200 bg-white p-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="font-medium text-slate-900">{item.title}</p>
              <p className="text-xs text-slate-500">Due: {item.dueDate}</p>
            </div>
            <Badge className="bg-slate-100 text-slate-700">{item.status}</Badge>
          </div>
          {item.proofUrl ? <p className="mt-1 truncate text-xs text-slate-500">{item.proofUrl}</p> : null}
          {item.status === 'pending' || item.status === 'rejected' ? (
            <DeliverableProofForm deliverableId={item.id} onSubmit={onSubmitProof} />
          ) : null}
        </div>
      ))}
    </div>
  );
}
