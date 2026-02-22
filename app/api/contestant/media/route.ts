import { NextRequest, NextResponse } from 'next/server';
import {
  addContestantMedia,
  getContestantMedia,
  isYouTubeUrl,
  normalizeYouTubeUrl,
  isContestantProfileLocked,
} from '@/lib/contestant-runtime-store';

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
    if (!isYouTubeUrl(url)) {
      return NextResponse.json({ message: 'Only YouTube URLs are allowed for intro videos' }, { status: 400 });
    }
    return NextResponse.json(addContestantMedia({ kind, label, url: normalizeYouTubeUrl(url) }), { status: 201 });
  }

  return NextResponse.json(addContestantMedia({ kind, label, url }), { status: 201 });
}
