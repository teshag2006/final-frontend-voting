import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/server/api-auth';
import { getVoterProfile, updateVoterProfile } from '@/lib/voter-runtime-store';

export async function GET(request: NextRequest) {
  const access = requireRole(request, ['voter']);
  if (!access.ok) return access.response;
  return NextResponse.json(getVoterProfile(access.user));
}

export async function PATCH(request: NextRequest) {
  const access = requireRole(request, ['voter']);
  if (!access.ok) return access.response;

  const payload = (await request.json().catch(() => ({}))) as { fullName?: string };
  const fullName = String(payload.fullName || '').trim();
  if (!fullName) {
    return NextResponse.json({ message: 'fullName is required' }, { status: 400 });
  }
  return NextResponse.json(updateVoterProfile(access.user, { fullName }));
}
