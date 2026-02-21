import { NextResponse } from 'next/server';
import { getContestantPublicVerification } from '@/lib/contestant-runtime-store';

export async function GET() {
  return NextResponse.json(getContestantPublicVerification());
}
