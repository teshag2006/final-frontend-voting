import { NextResponse } from 'next/server';
import { getEventSponsors } from '@/lib/sponsorship-mock';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ eventSlug: string }> }
) {
  const { eventSlug } = await params;
  return NextResponse.json(getEventSponsors(eventSlug));
}
