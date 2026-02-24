import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/server/api-auth';
import { verifyVoterPhone } from '@/lib/voter-runtime-store';

export async function POST(request: NextRequest) {
  const access = requireRole(request, ['voter']);
  if (!access.ok) return access.response;

  const payload = (await request.json().catch(() => ({}))) as {
    phoneNumber?: string;
    otp?: string;
  };

  const phoneNumber = String(payload.phoneNumber || '').trim();
  if (!phoneNumber) {
    return NextResponse.json({ message: 'phoneNumber is required' }, { status: 400 });
  }

  const otp = String(payload.otp || '').trim();
  if (otp && otp !== '123456') {
    return NextResponse.json({ message: 'Invalid OTP' }, { status: 400 });
  }

  return NextResponse.json(verifyVoterPhone(access.user, phoneNumber));
}
