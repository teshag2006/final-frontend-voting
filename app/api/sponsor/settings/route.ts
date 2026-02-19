import { NextResponse } from 'next/server';
import { mockSponsorProfileSettings } from '@/lib/sponsorship-mock';

export async function GET() {
  return NextResponse.json(mockSponsorProfileSettings);
}
