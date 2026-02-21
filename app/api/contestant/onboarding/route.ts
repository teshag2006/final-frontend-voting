import { NextRequest, NextResponse } from 'next/server';
import {
  getContestantOnboarding,
  isContestantProfileLocked,
  updateContestantOnboarding,
} from '@/lib/contestant-runtime-store';

export async function GET() {
  return NextResponse.json(getContestantOnboarding());
}

export async function PATCH(request: NextRequest) {
  if (isContestantProfileLocked()) {
    return NextResponse.json(
      { message: 'Profile is locked after approval. Submit a change request.' },
      { status: 423 }
    );
  }
  const payload = await request.json();
  return NextResponse.json(updateContestantOnboarding(payload || {}));
}
