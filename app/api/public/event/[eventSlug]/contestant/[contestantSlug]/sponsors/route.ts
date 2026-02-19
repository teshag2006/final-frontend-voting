import { NextResponse } from 'next/server';
import { getContestantSponsors } from '@/lib/sponsorship-mock';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ eventSlug: string; contestantSlug: string }> }
) {
  const { eventSlug, contestantSlug } = await params;
  return NextResponse.json(getContestantSponsors(eventSlug, contestantSlug));
}
