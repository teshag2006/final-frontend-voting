'use client';

export async function sendSponsorImpression(payload: {
  sponsorId: string;
  placementId?: string;
  sourcePage: string;
  eventSlug?: string;
  contestantSlug?: string;
}) {
  try {
    await fetch('/api/public/sponsor-impression', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {
    // Non-blocking analytics
  }
}

export async function sendSponsorClick(payload: {
  sponsorId: string;
  placementId?: string;
  sourcePage: string;
  eventSlug?: string;
  contestantSlug?: string;
  targetUrl?: string;
}) {
  try {
    await fetch('/api/public/sponsor-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {
    // Non-blocking analytics
  }
}
