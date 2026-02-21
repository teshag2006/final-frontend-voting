'use client';

import type { ContestantSponsorOfferThreadMessage } from '@/lib/contestant-runtime-store';

export function OfferThread({ messages }: { messages: ContestantSponsorOfferThreadMessage[] }) {
  return (
    <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Offer Thread</p>
      {messages.length === 0 ? (
        <p className="text-sm text-slate-500">No messages yet.</p>
      ) : (
        messages.map((message) => (
          <div key={message.id} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
            <p className="font-medium capitalize text-slate-800">{message.by}</p>
            <p className="text-slate-700">{message.message}</p>
            <p className="text-xs text-slate-500">{new Date(message.at).toLocaleString()}</p>
          </div>
        ))
      )}
    </div>
  );
}
