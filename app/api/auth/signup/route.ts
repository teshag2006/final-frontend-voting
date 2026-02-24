import { NextRequest } from 'next/server';
import { buildSigninResponse, jsonError } from '@/lib/server/auth-route-utils';
import { registerServerVoter } from '@/lib/server/auth-users';

function parseSignupPayload(payload: unknown): { name: string; email: string; password: string } {
  const body = payload as { name?: unknown; email?: unknown; password?: unknown };
  return {
    name: String(body?.name || '').trim(),
    email: String(body?.email || '').trim().toLowerCase(),
    password: String(body?.password || '').trim(),
  };
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = parseSignupPayload(await request.json());
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

    const user = registerServerVoter(name, email, password);
    if (!user) {
      return jsonError('An account with this email already exists', 409);
    }

    return buildSigninResponse(user);
  } catch {
    return jsonError('Malformed request', 400);
  }
}
