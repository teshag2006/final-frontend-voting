import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/server/session';
import { SESSION_COOKIE } from '@/lib/server/session-constants';

export async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const user = verifySessionToken(token);

  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({ user });
}
