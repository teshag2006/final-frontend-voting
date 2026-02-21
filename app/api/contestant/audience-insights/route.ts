import { NextResponse } from 'next/server';
import { getContestantAudienceInsights } from '@/lib/contestant-runtime-store';

export async function GET() {
  return NextResponse.json(getContestantAudienceInsights());
}
