import { NextRequest, NextResponse } from 'next/server';
import { verifyServerUser } from '@/lib/server/auth-users';
import { createSessionToken, getSessionCookieConfig } from '@/lib/server/session';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body?.email || '').trim().toLowerCase();
    const password = String(body?.password || '').trim();
    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    const user = verifyServerUser(email, password);
    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const token = createSessionToken(user);
    const response = NextResponse.json({ user });
    const cookie = getSessionCookieConfig();
    response.cookies.set(cookie.name, token, cookie.options);
    return response;
  } catch {
    return NextResponse.json({ message: 'Malformed request' }, { status: 400 });
  }
}
