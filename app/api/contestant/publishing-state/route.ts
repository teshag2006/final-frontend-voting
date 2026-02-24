import { NextResponse } from 'next/server';
import { getContestantPublishingState } from '@/lib/contestant-runtime-store';
import { getAdminSettingsBundle } from '@/lib/admin-settings-runtime-store';

export async function GET() {
  const settings = getAdminSettingsBundle();
  const rawLimit = Number(settings?.event?.maxGalleryPhotosPerContestant);
  const maxGalleryPhotosPerContestant = Number.isFinite(rawLimit) && rawLimit > 0 ? rawLimit : 10;

  return NextResponse.json({
    ...getContestantPublishingState(),
    maxGalleryPhotosPerContestant,
  });
}
