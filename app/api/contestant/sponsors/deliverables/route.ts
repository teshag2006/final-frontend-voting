import { NextRequest, NextResponse } from 'next/server';
import { getContestantDeliverables, submitContestantDeliverableProof } from '@/lib/contestant-runtime-store';

export async function GET(request: NextRequest) {
  const campaignId = request.nextUrl.searchParams.get('campaignId') || undefined;
  return NextResponse.json(getContestantDeliverables(campaignId));
}

export async function PATCH(request: NextRequest) {
  const payload = await request.json();
  if (!payload?.deliverableId || !payload?.proofUrl) {
    return NextResponse.json({ message: 'deliverableId and proofUrl are required' }, { status: 400 });
  }
  const updated = submitContestantDeliverableProof({
    deliverableId: payload.deliverableId,
    proofUrl: payload.proofUrl,
  });
  if (!updated) {
    return NextResponse.json({ message: 'Deliverable not found' }, { status: 404 });
  }
  return NextResponse.json(updated);
}
