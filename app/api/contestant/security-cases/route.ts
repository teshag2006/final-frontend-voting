import { NextResponse } from 'next/server';
import { getContestantSecurityCases } from '@/lib/contestant-runtime-store';

export async function GET() {
  return NextResponse.json(getContestantSecurityCases());
}
