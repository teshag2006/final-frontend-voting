import { NextRequest, NextResponse } from 'next/server';
import {
  addContestantMedia,
  getContestantMedia,
  isYouTubeUrl,
  normalizeYouTubeUrl,
  isContestantProfileLocked,
  removeContestantMedia,
} from '@/lib/contestant-runtime-store';
import { getAdminSettingsBundle } from '@/lib/admin-settings-runtime-store';

function getAllowedMediaUrlPrefixes() {
  const prefixes: string[] = [];
  const publicBase = process.env.AWS_S3_PUBLIC_BASE_URL?.trim();
  if (publicBase) {
    prefixes.push(`${publicBase.replace(/\/+$/, '')}/`);
  }
  const bucket = process.env.AWS_S3_BUCKET?.trim();
  const region = process.env.AWS_REGION?.trim();
  if (bucket && region) {
    prefixes.push(`https://${bucket}.s3.${region}.amazonaws.com/`);
  }
  return prefixes;
}

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

  if (kind !== 'profile_photo' && kind !== 'gallery_image') {
    return NextResponse.json({ message: 'Unsupported media kind' }, { status: 400 });
  }

  if (kind === 'gallery_image') {
    const settings = getAdminSettingsBundle();
    const rawLimit = Number(settings?.event?.maxGalleryPhotosPerContestant);
    const maxGalleryPhotosPerContestant = Number.isFinite(rawLimit) && rawLimit > 0 ? rawLimit : 10;
    const existingGalleryCount = getContestantMedia().filter((item) => item.kind === 'gallery_image').length;

    if (existingGalleryCount >= maxGalleryPhotosPerContestant) {
      return NextResponse.json(
        { message: `Gallery photo limit reached (${maxGalleryPhotosPerContestant}). Remove an existing photo first.` },
        { status: 409 }
      );
    }
  }

  if (!/^https?:\/\//i.test(url)) {
    return NextResponse.json(
      { message: 'Image URL must be a valid https/http URL.' },
      { status: 400 }
    );
  }
  const allowedPrefixes = getAllowedMediaUrlPrefixes();
  if (allowedPrefixes.length === 0) {
    return NextResponse.json(
      { message: 'AWS media URL validation is not configured. Set AWS_S3_PUBLIC_BASE_URL or AWS_S3_BUCKET + AWS_REGION.' },
      { status: 500 }
    );
  }
  const isAwsHosted = allowedPrefixes.some((prefix) => url.startsWith(prefix));
  if (!isAwsHosted) {
    return NextResponse.json(
      { message: 'Image URL must be an AWS-hosted media URL uploaded through the platform.' },
      { status: 400 }
    );
  }

  return NextResponse.json(addContestantMedia({ kind, label, url }), { status: 201 });
}

export async function DELETE(request: NextRequest) {
  if (isContestantProfileLocked()) {
    return NextResponse.json(
      { message: 'Media is locked after approval. Submit a change request.' },
      { status: 423 }
    );
  }

  const id = String(request.nextUrl.searchParams.get('id') || '').trim();
  if (!id) {
    return NextResponse.json({ message: 'id is required' }, { status: 400 });
  }

  const ok = removeContestantMedia(id);
  if (!ok) {
    return NextResponse.json({ message: 'Media not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
