/**
 * Cookie utilities for authentication
 * NOTE: This file is now minimal since we use httpOnly cookies set by the backend.
 * These utilities are only for reading/writing non-httpOnly cookies like userRole and user-info.
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
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
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
 * Set user-info cookie for SSR hydration
 * This allows the server to pre-render with basic user info
 * @param userInfo Object with id and role (required), name and email (optional)
 */
export function setUserInfoCookie(userInfo: { id: string; role: string; name?: string; email?: string }) {
  if (typeof document === 'undefined') return;

  const value = JSON.stringify({
    id: userInfo.id,
    role: userInfo.role,
    name: userInfo.name,
    email: userInfo.email,
  });

  // Encode for safe cookie storage
  const encodedValue = encodeURIComponent(value);
  document.cookie = `user-info=${encodedValue}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`; // 30 days
}

/**
 * Get user-info from cookie
 */
export function getUserInfoCookie(): { id: string; role: string; name?: string; email?: string } | null {
  const value = getCookie('user-info');
  if (!value) return null;

  try {
    return JSON.parse(decodeURIComponent(value));
  } catch {
    return null;
  }
}

/**
 * Clear user-info cookie
 */
export function clearUserInfoCookie() {
  deleteCookie('user-info');
}

/**
 * Clear all client-accessible auth cookies
 * Note: httpOnly cookies (accessToken, refreshToken) are cleared by backend
 */
export function clearAuthCookies() {
  deleteCookie('userRole');
  deleteCookie('user-info');
}
