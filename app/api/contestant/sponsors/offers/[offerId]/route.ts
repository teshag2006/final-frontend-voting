import { NextRequest, NextResponse } from 'next/server';
import { updateContestantSponsorOffer } from '@/lib/contestant-runtime-store';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ offerId: string }> }
) {
  const { offerId } = await context.params;
  const payload = await request.json();
  const updated = updateContestantSponsorOffer(offerId, payload || {});
  if (!updated) {
    return NextResponse.json({ message: 'Offer not found' }, { status: 404 });
  }
  return NextResponse.json(updated);
}
