import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/server/api-auth';
import { buildSigninResponse } from '@/lib/server/auth-route-utils';

function resolveApiUrl(): string | null {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!base) return null;
  return base.replace(/\/$/, '');
}

function parseNumericId(raw: string): number | null {
  const digits = String(raw || '').replace(/\D+/g, '');
  if (!digits) return null;
  const value = Number(digits);
  if (!Number.isFinite(value) || value <= 0) return null;
  return value;
}

function extractEnvelopeData(payload: any): any {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return payload.data;
  }
  return payload;
}

export async function POST(request: NextRequest) {
  const access = requireRole(request, ['admin']);
  if (!access.ok) {
    return access.response;
  }

  const payload = (await request.json()) as {
    contestantId?: string;
  };

  const contestantId = parseNumericId(String(payload.contestantId || '').trim());
  if (!contestantId) {
    return NextResponse.json({ message: 'A valid contestantId is required' }, { status: 400 });
  }

  const apiBase = resolveApiUrl();
  if (!apiBase) {
    return NextResponse.json(
      { message: 'NEXT_PUBLIC_BACKEND_URL (or NEXT_PUBLIC_API_URL) is not configured' },
      { status: 500 }
    );
  }

  const adminToken = request.cookies.get('auth_token')?.value;
  if (!adminToken) {
    return NextResponse.json({ message: 'Missing admin auth token' }, { status: 401 });
  }

  const impersonate = await fetch(`${apiBase}/auth/admin/impersonate`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      target_type: 'contestant',
      target_id: contestantId,
    }),
    cache: 'no-store',
  });

  if (!impersonate.ok) {
    return NextResponse.json(
      { message: 'Contestant impersonation failed', statusCode: impersonate.status },
      { status: impersonate.status }
    );
  }

  const backendPayload = await impersonate.json().catch(() => null);
  const data = extractEnvelopeData(backendPayload) as
    | {
        access_token?: string;
        refresh_token?: string;
        user?: {
          id: number;
          email: string;
          full_name?: string;
          avatar_url?: string | null;
        };
      }
    | null;

  const accessToken = String(data?.access_token || '');
  const refreshToken = String(data?.refresh_token || '');
  const backendUser = data?.user;

  if (!accessToken || !backendUser?.email) {
    return NextResponse.json(
      { message: 'Impersonation tokens are missing from backend response' },
      { status: 502 }
    );
  }

  const name = String(backendUser.full_name || '').trim() || backendUser.email;
  const avatar = String(backendUser.avatar_url || '').trim() || undefined;

  const user = {
    id: String(backendUser.id),
    email: String(backendUser.email).toLowerCase(),
    name,
    role: 'contestant' as const,
    avatar,
  };

  const response = buildSigninResponse(user, {
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  const secure = process.env.NODE_ENV === 'production';
  response.cookies.set('auth_token', accessToken, {
    path: '/',
    sameSite: 'lax',
    secure,
  });
  if (refreshToken) {
    response.cookies.set('refresh_token', refreshToken, {
      path: '/',
      sameSite: 'lax',
      secure,
    });
  }
  return response;
}
