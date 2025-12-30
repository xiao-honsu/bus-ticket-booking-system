import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decodeJwt } from 'jose';

// Cookie options for user-info (non-httpOnly, client-readable)
const getUserInfoCookieOptions = (isProduction: boolean) => ({
  httpOnly: false, // Client can read this for SSR hydration
  secure: isProduction,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 30, // 30 days (same as refreshToken)
});

export function middleware(request: NextRequest) {
  // Middleware runs on server-side, can only check httpOnly cookies
  // We use refreshToken presence to determine if user is authenticated
  const refreshToken = request.cookies.get('refreshToken')?.value;
  const pathname = request.nextUrl.pathname;

  // Create response - we'll modify cookies on it
  const response = NextResponse.next();
  const isProduction = process.env.NODE_ENV === 'production';

  // Decode refresh token and set user-info cookie for SSR hydration

  try {
    if (!refreshToken) throw new Error('No refresh token');
    const decoded = decodeJwt(refreshToken);

    // Check if token is expired
    const exp = decoded.exp as number | undefined;
    const isExpired = exp ? Date.now() >= exp * 1000 : false;
    if (isExpired) {
      throw new Error('Refresh token is expired');
    }
    // Set user-info cookie with basic info (non-sensitive data only)
    // This allows server-side rendering to know about the user without API calls
    const userInfo = JSON.stringify({
      id: decoded.sub,
      role: decoded.role,
      // Note: name/email not in JWT, will be fetched via background sync
    });

    response.cookies.set('user-info', userInfo, getUserInfoCookieOptions(isProduction));
  } catch (error) {
    // Token decode failed - clear user-info cookie
    response.cookies.delete('user-info');
  }

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

  return response;
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
