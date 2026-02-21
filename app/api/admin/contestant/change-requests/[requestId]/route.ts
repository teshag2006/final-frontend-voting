import { NextRequest, NextResponse } from 'next/server';
import { reviewContestantChangeRequest } from '@/lib/contestant-runtime-store';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ requestId: string }> }
) {
  const { requestId } = await context.params;
  const payload = await request.json();
  const action = payload?.action as 'approve' | 'reject' | undefined;
  const note = payload?.note ? String(payload.note) : undefined;
  if (!action) {
    return NextResponse.json({ message: 'action is required' }, { status: 400 });
  }
  const updated = reviewContestantChangeRequest({ requestId, action, note });
  if (!updated) {
    return NextResponse.json({ message: 'Change request not found' }, { status: 404 });
  }
  return NextResponse.json(updated);
}
