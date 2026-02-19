import 'server-only';

import type { UserRole } from '@/lib/mock-users';

export interface EdgeSessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

interface EdgeSessionPayload extends EdgeSessionUser {
  iat: number;
  exp: number;
}

function getSessionSecret(): string | null {
  const secret = process.env.SESSION_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === 'production') return null;
  return 'dev-only-session-secret-change-me';
}

function toBytes(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

function base64UrlToUtf8(base64Url: string): string {
  const padded = base64Url.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(base64Url.length / 4) * 4, '=');
  if (typeof atob === 'function') {
    return decodeURIComponent(
      Array.prototype.map
        .call(atob(padded), (char: string) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join('')
    );
  }
  return Buffer.from(padded, 'base64').toString('utf8');
}

function bytesToBase64Url(bytes: Uint8Array): string {
  if (typeof btoa === 'function') {
    const binary = Array.from(bytes).map((byte) => String.fromCharCode(byte)).join('');
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }
  return Buffer.from(bytes).toString('base64url');
}

async function signPayload(payload: string): Promise<string> {
  const secret = getSessionSecret();
  if (!secret) {
    return '';
  }
  const key = await crypto.subtle.importKey(
    'raw',
    toArrayBuffer(toBytes(secret)),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, toArrayBuffer(toBytes(payload)));
  return bytesToBase64Url(new Uint8Array(signature));
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i += 1) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export async function verifySessionTokenEdge(token?: string | null): Promise<EdgeSessionUser | null> {
  if (!token) return null;

  const [encodedPayload, providedSignature] = token.split('.');
  if (!encodedPayload || !providedSignature) return null;

  const expectedSignature = await signPayload(encodedPayload);
  if (!expectedSignature) return null;
  if (!safeEqual(providedSignature, expectedSignature)) return null;

  try {
    const parsed = JSON.parse(base64UrlToUtf8(encodedPayload)) as EdgeSessionPayload;
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

export function decodeSessionTokenUnsafeEdge(token?: string | null): EdgeSessionUser | null {
  if (!token) return null;
  const [encodedPayload] = token.split('.');
  if (!encodedPayload) return null;

  try {
    const parsed = JSON.parse(base64UrlToUtf8(encodedPayload)) as EdgeSessionPayload;
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
