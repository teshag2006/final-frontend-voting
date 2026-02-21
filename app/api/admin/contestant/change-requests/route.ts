import { NextResponse } from 'next/server';
import { getContestantChangeRequests } from '@/lib/contestant-runtime-store';

export async function GET() {
  return NextResponse.json(getContestantChangeRequests());
}
