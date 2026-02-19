import 'server-only';

import { createHmac, timingSafeEqual } from 'crypto';
import type { UserRole } from '@/lib/mock-users';
import { SESSION_COOKIE } from '@/lib/server/session-constants';

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

interface SessionPayload extends SessionUser {
  iat: number;
  exp: number;
}

const ONE_HOUR_SECONDS = 60 * 60;

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (secret) return secret;

  if (process.env.NODE_ENV === 'production') {
    throw new Error('SESSION_SECRET must be configured in production.');
  }

  return 'dev-only-session-secret-change-me';
}

function toBase64Url(input: string): string {
  return Buffer.from(input, 'utf8').toString('base64url');
}

function fromBase64Url(input: string): string {
  return Buffer.from(input, 'base64url').toString('utf8');
}

function signPayload(encodedPayload: string): string {
  return createHmac('sha256', getSessionSecret()).update(encodedPayload).digest('base64url');
}

export function createSessionToken(user: SessionUser): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    ...user,
    iat: now,
    exp: now + ONE_HOUR_SECONDS,
  };

  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = signPayload(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function verifySessionToken(token?: string | null): SessionUser | null {
  if (!token) return null;

  const [encodedPayload, providedSignature] = token.split('.');
  if (!encodedPayload || !providedSignature) return null;

  const expectedSignature = signPayload(encodedPayload);
  const providedBuffer = Buffer.from(providedSignature, 'utf8');
  const expectedBuffer = Buffer.from(expectedSignature, 'utf8');

  if (providedBuffer.length !== expectedBuffer.length) return null;
  if (!timingSafeEqual(providedBuffer, expectedBuffer)) return null;

  try {
    const parsed = JSON.parse(fromBase64Url(encodedPayload)) as SessionPayload;
    const now = Math.floor(Date.now() / 1000);
    if (!parsed.exp || parsed.exp <= now) return null;

    return {
      id: parsed.id,
      email: parsed.email,
      name: parsed.name,
      role: parsed.role,
      avatar: parsed.avatar,
    };
  } catch {
    return null;
  }
}

export function getSessionCookieConfig() {
  return {
    name: SESSION_COOKIE,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: ONE_HOUR_SECONDS,
    },
  };
}
