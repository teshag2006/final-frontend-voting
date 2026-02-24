import { NextRequest, NextResponse } from 'next/server';
import { confirmServerUserEmail } from '@/lib/server/auth-users';

export async function GET(request: NextRequest) {
  const token = String(request.nextUrl.searchParams.get('token') || '').trim();
  if (!token) {
    return NextResponse.json({ message: 'token is required' }, { status: 400 });
  }

  const user = confirmServerUserEmail(token);
  if (!user) {
    return NextResponse.json({ message: 'Invalid or expired confirmation link' }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    email: user.email,
  });
}

