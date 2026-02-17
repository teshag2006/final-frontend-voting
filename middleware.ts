import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware for route protection and auth validation
 * Prevents unauthorized access before pages render (avoids redirect flicker)
 */

const publicRoutes = ['/login', '/signup', '/forgot-password', '/reset-password'];
const adminRoutes = ['/admin'];
const contestantRoutes = ['/events/contestant'];
const mediaRoutes = ['/media'];
const voterRoutes = ['/voter'];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const authToken = request.cookies.get('auth_token')?.value;
  const userRole = request.cookies.get('user_role')?.value;

  // Allow public routes without auth
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    // If already authenticated, redirect from login to dashboard
    if (authToken && pathname === '/login') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Allow root route (will handle redirects)
  if (pathname === '/') {
    return NextResponse.next();
  }

  // Require authentication for protected routes
  if (!authToken) {
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
