import { NextResponse } from 'next/server';
import { mockNotifications } from '@/lib/dashboard-mock';

export async function GET() {
  return NextResponse.json(mockNotifications);
}
