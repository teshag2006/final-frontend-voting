import { NextRequest } from 'next/server';
import { buildSigninResponse, jsonError } from '@/lib/server/auth-route-utils';
import {
  registerServerContestant,
  registerServerSponsor,
  registerServerVoter,
} from '@/lib/server/auth-users';
import type { UserRole } from '@/lib/mock-users';

function parseSignupPayload(payload: unknown): {
  name: string;
  email: string;
  password: string;
  role: Extract<UserRole, 'voter' | 'sponsor' | 'contestant'>;
} {
  const body = payload as { name?: unknown; email?: unknown; password?: unknown; role?: unknown };
  const roleRaw = String(body?.role || 'voter').trim().toLowerCase();
  const role = (roleRaw === 'sponsor' || roleRaw === 'contestant' || roleRaw === 'voter'
    ? roleRaw
    : 'voter') as Extract<UserRole, 'voter' | 'sponsor' | 'contestant'>;
  return {
    name: String(body?.name || '').trim(),
    email: String(body?.email || '').trim().toLowerCase(),
    password: String(body?.password || '').trim(),
    role,
  };
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role } = parseSignupPayload(await request.json());
    if (!name || !email || !password) {
      return jsonError('Name, email, and password are required', 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return jsonError('Invalid email format', 400);
    }

    if (password.length < 8) {
      return jsonError('Password must be at least 8 characters', 400);
    }

    const user =
      role === 'sponsor'
        ? registerServerSponsor(name, email, password)
        : role === 'contestant'
          ? registerServerContestant(name, email, password)
          : registerServerVoter(name, email, password);

    if (!user) {
      return jsonError('An account with this email already exists', 409);
    }

    return buildSigninResponse(user);
  } catch {
    return jsonError('Malformed request', 400);
  }
}
