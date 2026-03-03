import { NextResponse } from 'next/server';

function resolveApiUrl(): string | null {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!base) return null;
  return base.replace(/\/$/, '');
}

function readCookieValue(cookieHeader: string | null, key: string): string | null {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(';');
  for (const part of parts) {
    const [name, ...rest] = part.trim().split('=');
    if (name === key) {
      return decodeURIComponent(rest.join('='));
    }
  }
  return null;
}

export async function proxyRequest(
  request: Request,
  endpoint: string
): Promise<NextResponse> {
  const apiBase = resolveApiUrl();
  if (!apiBase) {
    return NextResponse.json(
      { message: 'NEXT_PUBLIC_BACKEND_URL (or NEXT_PUBLIC_API_URL) is not configured' },
      { status: 500 }
    );
  }

  const incomingUrl = new URL(request.url);
  const targetUrl = new URL(`${apiBase}${endpoint}`);
  targetUrl.search = incomingUrl.search;

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (lower === 'host' || lower === 'content-length') return;
    headers.set(key, value);
  });

  if (!headers.has('Authorization')) {
    const authToken = readCookieValue(request.headers.get('cookie'), 'auth_token');
    if (authToken) {
      headers.set('Authorization', `Bearer ${authToken}`);
    }
  }

  const method = request.method.toUpperCase();
  const init: RequestInit = {
    method,
    headers,
    cache: 'no-store',
  };

  if (method !== 'GET' && method !== 'HEAD') {
    init.body = await request.text();
  }

  try {
    const response = await fetch(targetUrl.toString(), init);
    const body = await response.text();
    const outHeaders = new Headers();
    const contentType = response.headers.get('content-type');
    if (contentType) outHeaders.set('content-type', contentType);
    return new NextResponse(body, {
      status: response.status,
      headers: outHeaders,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Backend proxy failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 502 }
    );
  }
}
