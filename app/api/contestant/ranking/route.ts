import { NextResponse } from 'next/server';
import { mockRankingData } from '@/lib/dashboard-mock';

export async function GET() {
  return NextResponse.json(mockRankingData);
}
