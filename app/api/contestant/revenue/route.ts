import { NextResponse } from 'next/server';
import { mockRevenueData } from '@/lib/dashboard-mock';

export async function GET() {
  return NextResponse.json(mockRevenueData);
}
