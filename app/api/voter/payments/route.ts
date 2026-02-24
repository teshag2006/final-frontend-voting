import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/server/api-auth';
import { getVoterPayments, registerVoterPayment } from '@/lib/voter-runtime-store';

export async function GET(request: NextRequest) {
  const access = requireRole(request, ['voter']);
  if (!access.ok) return access.response;
  return NextResponse.json(getVoterPayments(access.user));
}

export async function POST(request: NextRequest) {
  const access = requireRole(request, ['voter']);
  if (!access.ok) return access.response;

  const payload = (await request.json().catch(() => ({}))) as {
    paymentId?: string;
    votesPurchased?: number;
    amount?: number;
    currency?: string;
    paymentMethod?: string;
    eventName?: string;
    status?: 'pending' | 'confirmed' | 'failed' | 'refunded';
  };

  if (!payload.paymentId || !payload.votesPurchased) {
    return NextResponse.json({ message: 'paymentId and votesPurchased are required' }, { status: 400 });
  }

  try {
    const result = registerVoterPayment(access.user, {
      paymentId: String(payload.paymentId),
      votesPurchased: Number(payload.votesPurchased),
      amount: Number(payload.amount || 0),
      currency: payload.currency,
      paymentMethod: payload.paymentMethod,
      eventName: payload.eventName,
      status: payload.status,
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Could not register payment' },
      { status: 400 }
    );
  }
}
