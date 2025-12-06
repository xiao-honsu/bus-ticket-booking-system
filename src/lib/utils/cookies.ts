/**
 * Cookie utilities for authentication
 */

export interface AuthCookies {
  token: string | null;
  refreshToken: string | null;
  userRole: string | null;
}

/**
 * Get a cookie value by name
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
 * Set a cookie
 */
export function setCookie(name: string, value: string, maxAge: number) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}`;
}

/**
 * Delete a cookie
 */
export function deleteCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; path=/; max-age=0`;
}

/**
 * Get all auth-related cookies
 */
export function getAuthCookies(): AuthCookies {
  return {
    token: getCookie('token'),
    refreshToken: getCookie('refreshToken'),
    userRole: getCookie('userRole'),
  };
}

/**
 * Set all auth cookies
 */
export function setAuthCookies(tokens: { access: { token: string }; refresh: { token: string } }, userRole: string) {
  // Access token - 30 minutes
  setCookie('token', tokens.access.token, 60 * 30);
  // Refresh token - 30 days
  setCookie('refreshToken', tokens.refresh.token, 60 * 60 * 24 * 30);
  // User role - 30 days
  setCookie('userRole', userRole, 60 * 60 * 24 * 30);
}

/**
 * Clear all auth cookies
 */
export function clearAuthCookies() {
  deleteCookie('token');
  deleteCookie('refreshToken');
  deleteCookie('userRole');
}
