import { NextRequest, NextResponse } from 'next/server';
import {
  getContestantCompliance,
  isContestantProfileLocked,
  updateContestantCompliance,
} from '@/lib/contestant-runtime-store';
import { isContestantGender } from '@/lib/contestant-gender';

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
  const payload = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const current = getContestantCompliance();
  const merged = { ...current, ...(payload || {}) };
  if (!isContestantGender(merged.gender)) {
    return NextResponse.json({ message: 'Gender is required for contestant compliance' }, { status: 400 });
  }
  const ageValue = Number(merged.age);
  if (!Number.isFinite(ageValue) || ageValue < 13 || ageValue > 120) {
    return NextResponse.json({ message: 'Age is required for contestant compliance' }, { status: 400 });
  }

  try {
    return NextResponse.json(updateContestantCompliance({ ...payload, age: payload.age !== undefined ? Number(payload.age) : undefined }));
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Invalid compliance payload' },
      { status: 400 }
    );
  }
}
