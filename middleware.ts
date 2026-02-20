import { NextRequest, NextResponse } from 'next/server';
import { verifySessionTokenEdge } from '@/lib/server/session-edge';
import { SESSION_COOKIE } from '@/lib/server/session-constants';

/**
 * Middleware for route protection and auth validation
 * Prevents unauthorized access before pages render (avoids redirect flicker)
 */

const publicRoutes = ['/login', '/signup', '/forgot-password', '/reset-password'];
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const sessionUser = await verifySessionTokenEdge(token);
  const isAuthenticated = Boolean(sessionUser);
  const userRole = sessionUser?.role;
  const isPublicEventsRoute = pathname.startsWith('/events') && !pathname.startsWith('/events/contestant');

  // Allow public routes without auth
  if (publicRoutes.some(route => pathname.startsWith(route)) || isPublicEventsRoute) {
    return NextResponse.next();
  }

  // Allow root route (will handle redirects)
  if (pathname === '/') {
    return NextResponse.next();
  }

  // Require authentication for protected routes
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Role-based access control
  if (pathname.startsWith('/admin') && userRole !== 'admin') {
    return NextResponse.redirect(new URL('/access-denied', request.url));
  }

  if (pathname.startsWith('/events/contestant') && userRole !== 'contestant') {
    return NextResponse.redirect(new URL('/access-denied', request.url));
  }

  if (pathname.startsWith('/media') && userRole !== 'media') {
    return NextResponse.redirect(new URL('/access-denied', request.url));
  }

  if (pathname.startsWith('/voter') && userRole !== 'voter') {
    return NextResponse.redirect(new URL('/access-denied', request.url));
  }

  if (pathname.startsWith('/sponsors') && userRole !== 'sponsor') {
    return NextResponse.redirect(new URL('/access-denied', request.url));
  }

  return NextResponse.next();
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
