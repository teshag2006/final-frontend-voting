import { NextRequest, NextResponse } from 'next/server';
import {
  getContestantPublishingState,
  setContestantAdminReviewStatus,
} from '@/lib/contestant-runtime-store';

export async function GET() {
  return NextResponse.json(getContestantPublishingState());
}

export async function PATCH(request: NextRequest) {
  const payload = await request.json();
  const action = payload?.action as 'approve' | 'reject' | 'reopen' | undefined;
  const reason = payload?.reason ? String(payload.reason) : undefined;
  if (!action) {
    return NextResponse.json({ message: 'action is required' }, { status: 400 });
  }
  return NextResponse.json(setContestantAdminReviewStatus({ action, reason }));
}
