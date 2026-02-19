import { NextResponse } from 'next/server';
import { getSessionCookieConfig } from '@/lib/server/session';

export async function POST() {
  const response = NextResponse.json({ success: true });
  const cookie = getSessionCookieConfig();
  response.cookies.set(cookie.name, '', { ...cookie.options, maxAge: 0 });
  return response;
}

