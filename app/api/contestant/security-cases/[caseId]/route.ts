import { NextRequest, NextResponse } from 'next/server';
import { updateContestantSecurityCase } from '@/lib/contestant-runtime-store';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ caseId: string }> }
) {
  const { caseId } = await context.params;
  const payload = await request.json();
  const updated = updateContestantSecurityCase(caseId, payload || {});
  if (!updated) {
    return NextResponse.json({ message: 'Security case not found' }, { status: 404 });
  }
  return NextResponse.json(updated);
}
