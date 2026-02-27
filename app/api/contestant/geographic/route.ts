import { NextResponse } from 'next/server';
import { mockGeographicData } from '@/lib/dashboard-mock';

export async function GET() {
  return NextResponse.json(mockGeographicData);
}
