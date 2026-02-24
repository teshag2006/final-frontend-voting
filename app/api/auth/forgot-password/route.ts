import { NextRequest, NextResponse } from 'next/server';
import { createPasswordResetToken, getServerUserByEmail } from '@/lib/server/auth-users';
import { sendTransactionalEmail } from '@/lib/server/email-service';

export async function POST(request: NextRequest) {
  const payload = (await request.json().catch(() => ({}))) as { email?: string };
  const email = String(payload.email || '').trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ message: 'email is required' }, { status: 400 });
  }

  // Always return success to avoid account enumeration.
  const user = getServerUserByEmail(email);
  if (!user) {
    return NextResponse.json({ success: true });
  }

  const token = createPasswordResetToken(email);
  if (token) {
    const appBaseUrl = process.env.APP_BASE_URL || 'http://localhost:3000';
    const resetUrl = `${appBaseUrl}/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;
    await sendTransactionalEmail({
      to: email,
      subject: 'Reset your password',
      htmlBody: `<p>Hello ${user.name},</p><p>You requested a password reset. Click the link below to continue:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>This link expires in 30 minutes.</p>`,
      textBody: `Hello ${user.name},\n\nYou requested a password reset. Visit this link to continue:\n${resetUrl}\n\nThis link expires in 30 minutes.`,
    });
  }

  return NextResponse.json({ success: true });
}

