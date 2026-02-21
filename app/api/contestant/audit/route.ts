import { NextResponse } from 'next/server';
import { getContestantAudit } from '@/lib/contestant-runtime-store';

export async function GET() {
  return NextResponse.json(getContestantAudit());
}
