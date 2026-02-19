import 'server-only';

import { NextRequest, NextResponse } from 'next/server';
import type { ServerAuthUser } from '@/lib/server/auth-users';
import { createSessionToken, getSessionCookieConfig } from '@/lib/server/session';

export function parseSigninPayload(payload: unknown): { email: string; password: string } {
  const body = payload as { email?: unknown; password?: unknown };
  return {
    email: String(body?.email || '').trim().toLowerCase(),
    password: String(body?.password || '').trim(),
  };
}

export function jsonError(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}

export function buildSigninResponse(user: ServerAuthUser) {
  const token = createSessionToken(user);
  const response = NextResponse.json({ user });
  const cookie = getSessionCookieConfig();
  response.cookies.set(cookie.name, token, cookie.options);
  return response;
}

export function clearSessionCookie(response: NextResponse) {
  const cookie = getSessionCookieConfig();
  response.cookies.set(cookie.name, '', { ...cookie.options, maxAge: 0 });
  return response;
}

export function readSessionTokenFromRequest(request: NextRequest, cookieName: string) {
  return request.cookies.get(cookieName)?.value;
}

