import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/server/session';
import { SESSION_COOKIE } from '@/lib/server/session-constants';
import { readSessionTokenFromRequest } from '@/lib/server/auth-route-utils';

export async function GET(request: NextRequest) {
  const token = readSessionTokenFromRequest(request, SESSION_COOKIE);
  const user = verifySessionToken(token);

  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({ user });
}
