'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function DeliverableProofForm({
  deliverableId,
  onSubmit,
}: {
  deliverableId: string;
  onSubmit: (payload: { deliverableId: string; proofUrl: string }) => Promise<void>;
}) {
  const [proofUrl, setProofUrl] = useState('');

  return (
    <div className="mt-2 flex gap-2">
      <input
        value={proofUrl}
        onChange={(e) => setProofUrl(e.target.value)}
        placeholder="Proof URL"
        className="h-9 flex-1 rounded-md border border-slate-300 px-3 text-sm"
      />
      <Button
        size="sm"
        onClick={() => {
          if (!proofUrl.trim()) return;
          onSubmit({ deliverableId, proofUrl: proofUrl.trim() }).then(() => setProofUrl(''));
        }}
      >
        Submit
      </Button>
    </div>
  );
}
