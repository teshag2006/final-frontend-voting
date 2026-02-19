import 'server-only';

import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/server/session';
import { SESSION_COOKIE } from '@/lib/server/session-constants';
import type { UserRole } from '@/lib/mock-users';

export function getRequestSessionUser(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}

export function requireRole(request: NextRequest, roles: UserRole[]) {
  const user = getRequestSessionUser(request);
  if (!user) {
    return {
      ok: false as const,
      response: NextResponse.json({ message: 'Unauthorized' }, { status: 401 }),
    };
  }

  if (!roles.includes(user.role)) {
    return {
      ok: false as const,
      response: NextResponse.json({ message: 'Forbidden' }, { status: 403 }),
    };
  }

  return { ok: true as const, user };
}
