import { NextRequest, NextResponse } from 'next/server';
import {
  addContestantMedia,
  getContestantMedia,
  isContestantProfileLocked,
} from '@/lib/contestant-runtime-store';

const allowedVideoDomains = ['youtube.com', 'youtu.be', 'tiktok.com', 'instagram.com'];

export async function GET() {
  return NextResponse.json(getContestantMedia());
}

export async function POST(request: NextRequest) {
  if (isContestantProfileLocked()) {
    return NextResponse.json(
      { message: 'Media is locked after approval. Submit a change request.' },
      { status: 423 }
    );
  }
  const payload = await request.json();
  const kind = payload?.kind;
  const label = String(payload?.label || '').trim();
  const url = String(payload?.url || '').trim();

  if (!kind || !label || !url) {
    return NextResponse.json({ message: 'kind, label, and url are required' }, { status: 400 });
  }

  if (kind === 'intro_video_embed') {
    const lower = url.toLowerCase();
    const allowed = allowedVideoDomains.some((domain) => lower.includes(domain));
    if (!allowed) {
      return NextResponse.json({ message: 'Unsupported video embed domain' }, { status: 400 });
    }
  }

  return NextResponse.json(addContestantMedia({ kind, label, url }), { status: 201 });
}
