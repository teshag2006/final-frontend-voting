import { NextRequest } from 'next/server';
import { verifyServerUser } from '@/lib/server/auth-users';
import { buildSigninResponse, jsonError, parseSigninPayload } from '@/lib/server/auth-route-utils';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = parseSigninPayload(await request.json());
    if (!email || !password) {
      return jsonError('Email and password are required', 400);
    }

    const user = verifyServerUser(email, password);
    if (!user) {
      return jsonError('Invalid credentials', 401);
    }

    return buildSigninResponse(user);
  } catch {
    return jsonError('Malformed request', 400);
  }
}
