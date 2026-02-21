'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { OfferThread } from '@/components/contestant-sponsors/offer-thread';
import type { ContestantSponsorOfferItem } from '@/lib/contestant-runtime-store';

export function OfferInbox({
  offers,
  onUpdate,
}: {
  offers: ContestantSponsorOfferItem[];
  onUpdate: (offerId: string, payload: { action?: 'accept' | 'reject' | 'negotiate'; message?: string }) => Promise<void>;
}) {
  const [messageByOffer, setMessageByOffer] = useState<Record<string, string>>({});

  return (
    <div className="space-y-3">
      {offers.map((offer) => (
        <div key={offer.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="font-semibold text-slate-900">{offer.sponsorName}</p>
              <p className="text-sm text-slate-600">
                ${offer.agreedPrice.toLocaleString()} - {offer.durationDays} days
              </p>
            </div>
            <Badge className="bg-slate-100 text-slate-700">{offer.status}</Badge>
          </div>

          <div className="mt-2">
            <p className="text-sm font-medium text-slate-800">Deliverables</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-slate-700">
              {offer.deliverables.map((deliverable) => (
                <li key={deliverable}>{deliverable}</li>
              ))}
            </ul>
          </div>

          <div className="mt-3 grid gap-2 md:grid-cols-[1fr_auto_auto_auto]">
            <input
              value={messageByOffer[offer.id] || ''}
              onChange={(e) => setMessageByOffer((prev) => ({ ...prev, [offer.id]: e.target.value }))}
              placeholder="Negotiation message"
              className="h-9 rounded-md border border-slate-300 px-3 text-sm"
            />
            <Button
              variant="outline"
              onClick={() =>
                onUpdate(offer.id, { action: 'negotiate', message: messageByOffer[offer.id] || 'Requesting adjustment.' })
              }
            >
              Negotiate
            </Button>
            <Button onClick={() => onUpdate(offer.id, { action: 'accept' })}>Accept</Button>
            <Button variant="outline" onClick={() => onUpdate(offer.id, { action: 'reject' })}>
              Reject
            </Button>
          </div>

          <div className="mt-3">
            <OfferThread messages={offer.thread} />
          </div>
        </div>
      ))}
    </div>
  );
}
