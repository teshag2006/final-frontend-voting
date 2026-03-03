import { NextResponse } from 'next/server';

type SignupPayload = {
  full_name?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  role?: string;
  gender?: string;
};

function resolveApiUrl(): string | null {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!base) return null;
  return base.replace(/\/$/, '');
}

function normalizeRole(input: unknown): 'voter' | 'sponsor' | 'contestant' {
  const role = String(input || 'voter').trim().toLowerCase();
  if (role === 'sponsor' || role === 'contestant') return role;
  return 'voter';
}

function normalizeFullName(payload: SignupPayload): string {
  if (typeof payload.full_name === 'string' && payload.full_name.trim()) {
    return payload.full_name.trim();
  }
  if (typeof payload.name === 'string' && payload.name.trim()) {
    return payload.name.trim();
  }
  const first = String(payload.firstName || '').trim();
  const last = String(payload.lastName || '').trim();
  return `${first} ${last}`.trim();
}

function splitName(fullName: string): { first_name: string; last_name: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const first = parts[0] || 'User';
  const last = parts.slice(1).join(' ') || 'Account';
  return { first_name: first, last_name: last };
}

export async function POST(request: Request) {
  const apiBase = resolveApiUrl();
  if (!apiBase) {
    return NextResponse.json(
      { message: 'NEXT_PUBLIC_BACKEND_URL (or NEXT_PUBLIC_API_URL) is not configured' },
      { status: 500 }
    );
  }

  const body = (await request.json().catch(() => ({}))) as SignupPayload;
  const { first_name, last_name } = splitName(normalizeFullName(body));
  const outgoing = {
    first_name,
    last_name,
    email: String(body.email || '').trim().toLowerCase(),
    password: String(body.password || '').trim(),
    role: normalizeRole(body.role),
    ...(body.gender ? { gender: String(body.gender).trim().toLowerCase() } : {}),
  };

  const response = await fetch(`${apiBase}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(outgoing),
    cache: 'no-store',
  });

  const text = await response.text();
  return new NextResponse(text, {
    status: response.status,
    headers: { 'content-type': response.headers.get('content-type') || 'application/json' },
  });
}
