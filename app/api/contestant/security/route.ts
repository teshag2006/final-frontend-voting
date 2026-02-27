import { NextResponse } from 'next/server';
import { mockSecurityData } from '@/lib/dashboard-mock';

export async function GET() {
  return NextResponse.json(mockSecurityData);
}
