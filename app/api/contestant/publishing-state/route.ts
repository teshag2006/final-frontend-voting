import { NextResponse } from 'next/server';
import { getContestantPublishingState } from '@/lib/contestant-runtime-store';

export async function GET() {
  return NextResponse.json(getContestantPublishingState());
}
