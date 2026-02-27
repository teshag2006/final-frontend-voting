import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/server/api-auth';
import { verifyVoterPhone } from '@/lib/voter-runtime-store';

export async function POST(request: NextRequest) {
  const access = requireRole(request, ['voter']);
  if (!access.ok) return access.response;

  const payload = (await request.json().catch(() => ({}))) as {
    action?: 'send' | 'verify';
    phoneNumber?: string;
    otp?: string;
  };

  const action = payload.action || 'verify';
  const phoneNumber = String(payload.phoneNumber || '').trim();
  if (!phoneNumber) {
    return NextResponse.json({ message: 'phoneNumber is required' }, { status: 400 });
  }

  // Mock "send OTP" action. No state mutation occurs here.
  if (action === 'send') {
    return NextResponse.json({
      success: true,
      message: 'OTP sent',
    });
  }

  const otp = String(payload.otp || '').trim();
  if (!otp) {
    return NextResponse.json({ message: 'otp is required' }, { status: 400 });
  }

  if (otp !== '123456') {
    return NextResponse.json({ message: 'Invalid OTP' }, { status: 400 });
  }

  return NextResponse.json(verifyVoterPhone(access.user, phoneNumber));
}
