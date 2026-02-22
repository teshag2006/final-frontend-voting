import { NextRequest, NextResponse } from 'next/server';
import {
  getContestantProfile,
  isContestantProfileLocked,
  updateContestantProfile,
} from '@/lib/contestant-runtime-store';

export async function GET() {
  return NextResponse.json(getContestantProfile());
}

export async function PATCH(request: NextRequest) {
  if (isContestantProfileLocked()) {
    return NextResponse.json(
      { message: 'Profile is locked after approval. Submit a change request.' },
      { status: 423 }
    );
  }
  const payload = await request.json();
  try {
    return NextResponse.json(updateContestantProfile(payload || {}));
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Invalid profile payload' },
      { status: 400 }
    );
  }
}
