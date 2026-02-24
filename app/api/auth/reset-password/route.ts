import { NextRequest, NextResponse } from 'next/server';
import { resetServerUserPassword } from '@/lib/server/auth-users';

export async function POST(request: NextRequest) {
  const payload = (await request.json().catch(() => ({}))) as {
    email?: string;
    token?: string;
    newPassword?: string;
  };

  const email = String(payload.email || '').trim().toLowerCase();
  const token = String(payload.token || '').trim();
  const newPassword = String(payload.newPassword || '').trim();

  if (!email || !token || !newPassword) {
    return NextResponse.json({ message: 'email, token, and newPassword are required' }, { status: 400 });
  }

  if (newPassword.length < 8) {
    return NextResponse.json({ message: 'Password must be at least 8 characters' }, { status: 400 });
  }

  const ok = resetServerUserPassword(email, token, newPassword);
  if (!ok) {
    return NextResponse.json({ message: 'Invalid or expired reset token' }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

