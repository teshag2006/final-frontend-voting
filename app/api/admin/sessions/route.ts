import { NextRequest, NextResponse } from 'next/server';
import { generateMockSessions } from '@/lib/users-roles-mock';
import {
  getAdminSessions,
  revokeAllUserSessions,
  revokeSession,
  seedAdminSessions,
} from '@/lib/admin-sessions-runtime-store';

let seeded = false;

function ensureSeeded() {
  if (seeded) return;
  seedAdminSessions(generateMockSessions(15));
  seeded = true;
}

export async function GET() {
  ensureSeeded();
  return NextResponse.json(getAdminSessions());
}

export async function DELETE(request: NextRequest) {
  ensureSeeded();
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');
  const userId = searchParams.get('userId');

  if (sessionId) {
    const revoked = revokeSession(sessionId);
    return NextResponse.json({ revoked, sessions: getAdminSessions() });
  }

  if (userId) {
    const revoked = revokeAllUserSessions(userId);
    return NextResponse.json({ revoked, sessions: getAdminSessions() });
  }

  return NextResponse.json(
    { message: 'sessionId or userId query param is required' },
    { status: 400 }
  );
}
