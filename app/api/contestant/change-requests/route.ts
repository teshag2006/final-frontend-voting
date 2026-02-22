import { NextRequest, NextResponse } from 'next/server';
import {
  createContestantChangeRequest,
  getContestantChangeRequests,
  isYouTubeUrl,
  normalizeYouTubeUrl,
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

  if (type === 'profile') {
    const youtube = changePayload.youtube;
    if (typeof youtube === 'string') {
      const trimmed = youtube.trim();
      if (trimmed && !isYouTubeUrl(trimmed)) {
        return NextResponse.json(
          { message: 'Only a valid YouTube URL is allowed for intro video' },
          { status: 400 }
        );
      }
      if (trimmed) {
        changePayload.youtube = normalizeYouTubeUrl(trimmed);
      }
    }

    for (const handleKey of ['instagram', 'tiktok']) {
      const value = changePayload[handleKey];
      if (typeof value === 'string' && /^https?:\/\//i.test(value.trim())) {
        return NextResponse.json(
          { message: `${handleKey} must be a handle, not a URL` },
          { status: 400 }
        );
      }
    }
  }

  if (type === 'media') {
    const kind = changePayload.kind;
    const url = changePayload.url;
    if (kind === 'intro_video_embed' && typeof url === 'string' && url.trim() && !isYouTubeUrl(url.trim())) {
      return NextResponse.json(
        { message: 'Only a valid YouTube URL is allowed for intro videos' },
        { status: 400 }
      );
    }
    if (kind === 'intro_video_embed' && typeof url === 'string' && isYouTubeUrl(url.trim())) {
      changePayload.url = normalizeYouTubeUrl(url.trim());
    }
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
