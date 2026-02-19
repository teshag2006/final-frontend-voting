import { NextResponse } from 'next/server';
import { mockSponsorDashboardOverview } from '@/lib/sponsorship-mock';

export async function GET() {
  return NextResponse.json(mockSponsorDashboardOverview);
}
