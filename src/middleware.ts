import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decodeJwt } from 'jose';

export function middleware(request: NextRequest) {
  // Middleware runs on server-side, can only check httpOnly cookies
  // We use refreshToken presence to determine if user is authenticated
  const refreshToken = request.cookies.get('refreshToken')?.value;
  const pathname = request.nextUrl.pathname;

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/search',
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
  ];
  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(route + '/'));

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/checkout', '/booking'];
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  // Admin routes that require admin role
  const isAdminRoute = pathname.startsWith('/admin');

  // Redirect to login if accessing protected route without refreshToken
  if ((isProtectedRoute || isAdminRoute) && !refreshToken) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check role for admin routes
  if (isAdminRoute && refreshToken) {
    try {
      // Decode JWT to get user role (no verification needed, just reading payload)
      const decoded = decodeJwt(refreshToken);
      const userRole = decoded?.role as string | undefined;

      // Redirect non-admin users away from admin routes
      if (userRole !== 'admin') {
        const unauthorizedUrl = new URL('/unauthorized', request.url);
        return NextResponse.redirect(unauthorizedUrl);
      }
    } catch (error) {
      // If token decode fails, redirect to login
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      loginUrl.searchParams.set('session_expired', 'true');
      return NextResponse.redirect(loginUrl);
    }
  }

  // Allow logged-in users to access auth pages - they'll see a logout confirmation modal
  // No redirect here, let the client-side component handle it gracefully

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
