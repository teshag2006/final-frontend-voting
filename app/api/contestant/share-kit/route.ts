import { NextRequest, NextResponse } from 'next/server';
import {
  getContestantShareKit,
  upsertContestantShareKitLink,
} from '@/lib/contestant-runtime-store';

const allowedChannels = ['instagram', 'tiktok', 'youtube', 'x', 'facebook'] as const;

export async function GET() {
  return NextResponse.json(getContestantShareKit());
}

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const label = String(payload?.label || '').trim();
  const url = String(payload?.url || '').trim();
  const channel = String(payload?.channel || '').trim();
  const id = payload?.id ? String(payload.id) : undefined;

  if (!label || !url || !channel) {
    return NextResponse.json({ message: 'label, channel, and url are required' }, { status: 400 });
  }

  if (!allowedChannels.includes(channel as (typeof allowedChannels)[number])) {
    return NextResponse.json({ message: 'Unsupported channel' }, { status: 400 });
  }

  return NextResponse.json(
    upsertContestantShareKitLink({
      id,
      label,
      url,
      channel: channel as (typeof allowedChannels)[number],
    }),
    { status: 201 }
  );
}
