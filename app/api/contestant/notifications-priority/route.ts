import { NextResponse } from 'next/server';
import { getContestantPriorityNotifications } from '@/lib/contestant-runtime-store';

export async function GET() {
  return NextResponse.json(getContestantPriorityNotifications());
}
