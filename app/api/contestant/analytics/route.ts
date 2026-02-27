import { NextResponse } from 'next/server';
import { mockAnalyticsData } from '@/lib/dashboard-mock';

export async function GET() {
  return NextResponse.json(mockAnalyticsData);
}
