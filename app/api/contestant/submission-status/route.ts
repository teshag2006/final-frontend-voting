import { NextRequest, NextResponse } from 'next/server';
import { getContestantSubmissionStatus, updateContestantSubmissionStatus } from '@/lib/contestant-runtime-store';

export async function GET() {
  return NextResponse.json({ status: getContestantSubmissionStatus() });
}

export async function PATCH(request: NextRequest) {
  const payload = await request.json();
  const status = payload?.status;
  if (!status) {
    return NextResponse.json({ message: 'status is required' }, { status: 400 });
  }
  return NextResponse.json({ status: updateContestantSubmissionStatus(status) });
}
