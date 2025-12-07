/**
 * Cookie utilities for authentication
 * NOTE: This file is now minimal since we use httpOnly cookies set by the backend.
 * These utilities are only for reading non-httpOnly cookies like userRole.
 */

/**
 * Get a cookie value by name (only works for non-httpOnly cookies)
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(';').shift();
    return cookieValue || null;
  }

  return null;
}

/**
 * Set a non-httpOnly cookie (for client-side accessible data only like userRole)
 */
export function setCookie(name: string, value: string, maxAge: number) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Strict`;
}

/**
 * Delete a non-httpOnly cookie
 */
export function deleteCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; path=/; max-age=0`;
}

/**
 * Set user role cookie (for middleware access control)
 */
export function setUserRoleCookie(role: string) {
  setCookie('userRole', role, 60 * 60 * 24 * 30); // 30 days
}

/**
 * Get user role from cookie
 */
export function getUserRoleCookie(): string | null {
  return getCookie('userRole');
}

/**
 * Clear all client-accessible auth cookies
 * Note: httpOnly cookies (accessToken, refreshToken) are cleared by backend
 */
export function clearAuthCookies() {
  deleteCookie('userRole');
}
