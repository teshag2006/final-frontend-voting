import { NextRequest, NextResponse } from 'next/server';
import {
  createContestantProfileVersion,
  getContestantProfileVersions,
} from '@/lib/contestant-runtime-store';

export async function GET() {
  return NextResponse.json(getContestantProfileVersions());
}

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const label = String(payload?.label || '').trim();
  const note = String(payload?.note || '').trim();
  const fieldsUpdated = Array.isArray(payload?.fieldsUpdated)
    ? payload.fieldsUpdated.map((item: unknown) => String(item))
    : [];

  if (!label || !note) {
    return NextResponse.json({ message: 'label and note are required' }, { status: 400 });
  }

  return NextResponse.json(
    createContestantProfileVersion({
      label,
      note,
      fieldsUpdated,
    }),
    { status: 201 }
  );
}
