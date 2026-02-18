import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware for route protection and auth validation
 * Prevents unauthorized access before pages render (avoids redirect flicker)
 */

// Routes accessible without authentication
const publicRoutes = [
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/events',
  '/event/',
  '/results',
  '/leaderboard',
  '/category',
  '/how-it-works',
  '/privacy',
  '/terms',
  '/transparency',
  '/refund-policy',
  '/verify',
  '/receipt',
  '/access-denied',
  '/account-locked',
  '/session-expired',
  '/maintenance',
  '/anti-fraud',
];

// Routes that require authentication but are accessible to all authenticated users
const protectedRoutes = [
  '/profile',
  '/notifications',
  '/vote',
];
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

  // Protected routes require authentication
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!authToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  // Role-based access control for role-specific routes
  if (pathname.startsWith('/admin')) {
    if (!authToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (userRole !== 'admin') {
      return NextResponse.redirect(new URL('/access-denied', request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith('/events/contestant')) {
    if (!authToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (userRole !== 'contestant') {
      return NextResponse.redirect(new URL('/access-denied', request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith('/media')) {
    if (!authToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (userRole !== 'media') {
      return NextResponse.redirect(new URL('/access-denied', request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith('/voter')) {
    if (!authToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (userRole !== 'voter') {
      return NextResponse.redirect(new URL('/access-denied', request.url));
    }
    return NextResponse.next();
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
    '/((?!api|_next|favicon.ico|public).*)',
  ],
};
