import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/server/api-auth';
import { getVoterVotes } from '@/lib/voter-runtime-store';

export async function GET(request: NextRequest) {
  const access = requireRole(request, ['voter']);
  if (!access.ok) return access.response;
  return NextResponse.json(getVoterVotes(access.user));
}
