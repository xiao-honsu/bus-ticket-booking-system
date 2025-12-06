import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const userRole = request.cookies.get('userRole')?.value;
  const pathname = request.nextUrl.pathname;

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/search', '/auth/login', '/auth/register'];
  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith('/auth'));

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/checkout', '/booking'];
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  // Admin routes that require admin role
  const isAdminRoute = pathname.startsWith('/admin');

  // Redirect to login if accessing protected route without token
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to login if accessing admin route without token
  if (isAdminRoute && !token) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to home if accessing admin route without admin role
  if (isAdminRoute && token && userRole !== 'admin' && userRole !== 'operator') {
    return NextResponse.redirect(new URL('/', request.url));
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
