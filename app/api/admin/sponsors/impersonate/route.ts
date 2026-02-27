import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/server/api-auth';
import { buildSigninResponse } from '@/lib/server/auth-route-utils';

function toSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

export async function POST(request: NextRequest) {
  const access = requireRole(request, ['admin']);
  if (!access.ok) {
    return access.response;
  }

  const payload = (await request.json()) as {
    sponsorId?: string;
    name?: string;
    email?: string;
    avatar?: string;
  };

  const sponsorId = String(payload.sponsorId || '').trim();
  const name = String(payload.name || '').trim();
  const email = String(payload.email || '').trim().toLowerCase();
  const avatar = payload.avatar ? String(payload.avatar) : undefined;

  if (!sponsorId || !name) {
    return NextResponse.json(
      { message: 'sponsorId and name are required' },
      { status: 400 }
    );
  }

  const fallbackEmail = `${toSlug(name) || 'sponsor'}@sponsor.local`;
  const user = {
    id: `sponsor-imp-${toSlug(sponsorId || name)}`,
    email: email || fallbackEmail,
    name,
    role: 'sponsor' as const,
    avatar,
  };

  return buildSigninResponse(user);
}
