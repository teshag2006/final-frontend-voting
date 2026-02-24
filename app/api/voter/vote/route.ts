import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/server/api-auth';
import { castVoterVote } from '@/lib/voter-runtime-store';

export async function POST(request: NextRequest) {
  const access = requireRole(request, ['voter']);
  if (!access.ok) return access.response;

  const payload = (await request.json().catch(() => ({}))) as {
    categoryId?: string;
    categoryName?: string;
    contestantName?: string;
    isPaid?: boolean;
    quantity?: number;
  };

  if (!payload.categoryId || typeof payload.isPaid !== 'boolean') {
    return NextResponse.json({ message: 'categoryId and isPaid are required' }, { status: 400 });
  }

  try {
    const result = castVoterVote(access.user, {
      categoryId: String(payload.categoryId),
      categoryName: payload.categoryName ? String(payload.categoryName) : undefined,
      contestantName: payload.contestantName ? String(payload.contestantName) : undefined,
      isPaid: Boolean(payload.isPaid),
      quantity: Number(payload.quantity || 1),
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Vote failed' },
      { status: 400 }
    );
  }
}
