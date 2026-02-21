import { NextResponse } from 'next/server';
import { getContestantAttribution } from '@/lib/contestant-runtime-store';

export async function GET() {
  return NextResponse.json(getContestantAttribution());
}
