import { NextResponse } from 'next/server';
import { mockSponsorCampaigns } from '@/lib/sponsorship-mock';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventSlug = searchParams.get('eventSlug');
  const data = eventSlug
    ? mockSponsorCampaigns.filter((campaign) => campaign.eventSlug === eventSlug)
    : mockSponsorCampaigns;
  return NextResponse.json(data);
}
