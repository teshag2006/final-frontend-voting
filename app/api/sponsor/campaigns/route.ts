import { NextRequest, NextResponse } from 'next/server';
import {
  createSponsorCampaign,
  getSponsorCampaignTracking,
  type CreateSponsorCampaignPayload,
} from '@/lib/sponsor-runtime-store';

export async function GET(request: NextRequest) {
  const contestantSlug = request.nextUrl.searchParams.get('contestant');
  return NextResponse.json(getSponsorCampaignTracking(contestantSlug || undefined));
}

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as Partial<CreateSponsorCampaignPayload>;
  if (!payload.action || !payload.sponsorName || !payload.contestantSlug || !payload.campaignTitle) {
    return NextResponse.json({ message: 'Invalid campaign payload' }, { status: 400 });
  }

  const created = createSponsorCampaign({
    action: payload.action,
    sponsorName: payload.sponsorName,
    contestantSlug: payload.contestantSlug,
    campaignTitle: payload.campaignTitle,
    paymentReference: payload.paymentReference,
    deliverablesTotal: Number(payload.deliverablesTotal || 1),
  });

  return NextResponse.json(created, { status: 201 });
}
