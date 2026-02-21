import { NextResponse } from 'next/server';
import { getContestantReadiness } from '@/lib/contestant-runtime-store';

export async function GET() {
  return NextResponse.json(getContestantReadiness());
}
