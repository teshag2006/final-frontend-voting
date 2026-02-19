import { NextRequest, NextResponse } from 'next/server';
import { mockSponsorCampaignTracking } from '@/lib/sponsorship-mock';

export async function GET(request: NextRequest) {
  const contestantSlug = request.nextUrl.searchParams.get('contestant');
  const rows = contestantSlug
    ? mockSponsorCampaignTracking.filter((item) => item.contestantSlug === contestantSlug)
    : mockSponsorCampaignTracking;

  return NextResponse.json(rows);
}
