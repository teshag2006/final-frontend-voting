import { NextResponse } from 'next/server';
import { mockSponsorPlacements } from '@/lib/sponsorship-mock';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const contestantSlug = searchParams.get('contestantSlug');
  const data = contestantSlug
    ? mockSponsorPlacements.filter((placement) => placement.contestantSlug === contestantSlug)
    : mockSponsorPlacements;
  return NextResponse.json(data);
}
