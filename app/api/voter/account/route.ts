import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/server/api-auth';
import { deleteVoterAccount } from '@/lib/voter-runtime-store';

export async function DELETE(request: NextRequest) {
  const access = requireRole(request, ['voter']);
  if (!access.ok) return access.response;
  return NextResponse.json(deleteVoterAccount(access.user));
}
