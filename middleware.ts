import { NextRequest, NextResponse } from 'next/server';
import { verifySessionTokenEdge } from '@/lib/server/session-edge';
import { SESSION_COOKIE } from '@/lib/server/session-constants';

/**
 * Middleware for route protection and auth validation
 * Prevents unauthorized access before pages render (avoids redirect flicker)
 */

const publicRoutes = [
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/voting-faq',
  '/terms',
  '/privacy',
  '/fraud-policy',
  '/transparency',
  '/transparency-statement',
];

function withSecurityHeaders(response: NextResponse, request: NextRequest) {
  const isDev = process.env.NODE_ENV !== 'production';
  const csp = [
    "default-src 'self'",
    // Next.js dev tooling needs inline/eval in development.
    `script-src 'self' ${isDev ? "'unsafe-inline' 'unsafe-eval'" : ''}`.trim(),
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https: wss: ws:",
    "frame-src 'self' https://www.youtube.com https://youtube.com https://www.youtube-nocookie.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
  if (request.nextUrl.protocol === 'https:') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  return response;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const sessionUser = await verifySessionTokenEdge(token);
  const isAuthenticated = Boolean(sessionUser);
  const userRole = sessionUser?.role;
  const isPublicEventsRoute = pathname.startsWith('/events') && !pathname.startsWith('/events/contestant');

  // Allow public routes without auth
  if (publicRoutes.some(route => pathname.startsWith(route)) || isPublicEventsRoute) {
    return withSecurityHeaders(NextResponse.next(), request);
  }

  // Allow root route (will handle redirects)
  if (pathname === '/') {
    return withSecurityHeaders(NextResponse.next(), request);
  }

  // Require authentication for protected routes
  if (!isAuthenticated) {
    return withSecurityHeaders(NextResponse.redirect(new URL('/login', request.url)), request);
  }

  // Role-based access control
  if (pathname.startsWith('/admin') && userRole !== 'admin') {
    return withSecurityHeaders(NextResponse.redirect(new URL('/access-denied', request.url)), request);
  }

  if (pathname.startsWith('/events/contestant') && userRole !== 'contestant') {
    return withSecurityHeaders(NextResponse.redirect(new URL('/access-denied', request.url)), request);
  }

  if (pathname.startsWith('/media') && userRole !== 'media') {
    return withSecurityHeaders(NextResponse.redirect(new URL('/access-denied', request.url)), request);
  }

  if (pathname.startsWith('/voter') && userRole !== 'voter') {
    return withSecurityHeaders(NextResponse.redirect(new URL('/access-denied', request.url)), request);
  }

  if (pathname.startsWith('/sponsors') && userRole !== 'sponsor') {
    return withSecurityHeaders(NextResponse.redirect(new URL('/access-denied', request.url)), request);
  }

  return withSecurityHeaders(NextResponse.next(), request);
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
