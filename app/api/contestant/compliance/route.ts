import { NextRequest, NextResponse } from 'next/server';
import {
  getContestantCompliance,
  isContestantProfileLocked,
  updateContestantCompliance,
} from '@/lib/contestant-runtime-store';

export async function GET() {
  return NextResponse.json(getContestantCompliance());
}

export async function PATCH(request: NextRequest) {
  if (isContestantProfileLocked()) {
    return NextResponse.json(
      { message: 'Profile is locked after approval. Submit a change request.' },
      { status: 423 }
    );
  }
  const payload = await request.json();
  return NextResponse.json(updateContestantCompliance(payload || {}));
}
