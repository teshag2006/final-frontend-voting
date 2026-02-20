import { NextResponse } from 'next/server';
import { getSponsorSettings, updateSponsorSettings } from '@/lib/sponsor-runtime-store';
import type { SponsorProfileSettings } from '@/lib/sponsorship-mock';

export async function GET() {
  return NextResponse.json(getSponsorSettings());
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as Partial<SponsorProfileSettings>;
  const current = getSponsorSettings();
  const merged: SponsorProfileSettings = {
    ...current,
    ...body,
    general: { ...current.general, ...(body.general || {}) },
    contact: { ...current.contact, ...(body.contact || {}) },
    legal: { ...current.legal, ...(body.legal || {}) },
    security: { ...current.security, ...(body.security || {}) },
    profileCompletion: body.profileCompletion ?? current.profileCompletion,
  };

  return NextResponse.json(updateSponsorSettings(merged));
}
