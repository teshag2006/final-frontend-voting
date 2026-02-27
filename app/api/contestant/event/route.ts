import { NextResponse } from 'next/server';
import { mockEventDetails } from '@/lib/dashboard-mock';

export async function GET() {
  return NextResponse.json(mockEventDetails);
}
