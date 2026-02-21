import { NextRequest, NextResponse } from 'next/server';
import {
  createContestantChangeRequest,
  getContestantChangeRequests,
} from '@/lib/contestant-runtime-store';

const allowedTypes = ['onboarding', 'profile', 'media', 'compliance'] as const;

export async function GET() {
  return NextResponse.json(getContestantChangeRequests());
}

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const type = String(payload?.type || '').trim();
  const reason = String(payload?.reason || '').trim();
  const changePayload =
    payload?.payload && typeof payload.payload === 'object'
      ? (payload.payload as Record<string, unknown>)
      : {};

  if (!allowedTypes.includes(type as (typeof allowedTypes)[number])) {
    return NextResponse.json({ message: 'Unsupported request type' }, { status: 400 });
  }

  if (!reason) {
    return NextResponse.json({ message: 'reason is required' }, { status: 400 });
  }

  return NextResponse.json(
    createContestantChangeRequest({
      type: type as (typeof allowedTypes)[number],
      reason,
      payload: changePayload,
    }),
    { status: 201 }
  );
}
