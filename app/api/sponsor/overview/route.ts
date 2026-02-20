import { NextResponse } from 'next/server';
import { getSponsorOverview } from '@/lib/sponsor-runtime-store';

export async function GET() {
  return NextResponse.json(getSponsorOverview());
}
