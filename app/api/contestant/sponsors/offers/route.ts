import { NextResponse } from 'next/server';
import { getContestantSponsorOffers } from '@/lib/contestant-runtime-store';

export async function GET() {
  return NextResponse.json(getContestantSponsorOffers());
}
