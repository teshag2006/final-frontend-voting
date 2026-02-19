import { NextResponse } from 'next/server';
import { mockSponsorsData } from '@/lib/dashboard-mock';

export async function GET() {
  return NextResponse.json(mockSponsorsData);
}
