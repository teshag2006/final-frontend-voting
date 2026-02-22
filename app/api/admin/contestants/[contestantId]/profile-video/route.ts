import { NextRequest, NextResponse } from 'next/server';
import {
  getAdminContestantById,
  getAdminContestants,
  seedAdminContestants,
  type AdminContestantRecord,
  updateAdminContestantIntroVideo,
} from '@/lib/admin-contestants-runtime-store';
import { generateMockContestants } from '@/lib/contestants-management-mock';
import { isYouTubeUrl, normalizeYouTubeUrl } from '@/lib/contestant-runtime-store';

function ensureSeeded() {
  if (getAdminContestants().length > 0) return;
  seedAdminContestants(generateMockContestants(120) as AdminContestantRecord[]);
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ contestantId: string }> }
) {
  ensureSeeded();
  const { contestantId } = await context.params;
  const id = String(contestantId || '').trim();
  if (!id) {
    return NextResponse.json({ message: 'contestantId is required' }, { status: 400 });
  }
  const contestant = getAdminContestantById(id);
  if (!contestant) {
    return NextResponse.json({ message: 'Contestant not found' }, { status: 404 });
  }
  return NextResponse.json({ introVideoUrl: contestant.introVideoUrl || '' });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ contestantId: string }> }
) {
  ensureSeeded();
  const { contestantId } = await context.params;
  const id = String(contestantId || '').trim();
  if (!id) {
    return NextResponse.json({ message: 'contestantId is required' }, { status: 400 });
  }

  const payload = (await request.json().catch(() => ({}))) as { introVideoUrl?: string };
  const introVideoUrl = String(payload.introVideoUrl || '').trim();
  if (introVideoUrl && !isYouTubeUrl(introVideoUrl)) {
    return NextResponse.json({ message: 'Only valid YouTube URLs are allowed' }, { status: 400 });
  }

  const updated = updateAdminContestantIntroVideo(
    id,
    introVideoUrl ? normalizeYouTubeUrl(introVideoUrl) : ''
  );
  if (!updated) {
    return NextResponse.json({ message: 'Contestant not found' }, { status: 404 });
  }
  return NextResponse.json({ introVideoUrl: updated.introVideoUrl || '' });
}

