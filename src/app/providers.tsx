'use client';

import { useRef } from 'react';
import { Provider } from 'react-redux';
import { makeStore, AppStore } from '@/lib/store';
import { AuthInitializer } from '@/components/auth/AuthInitializer';

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore | undefined>(undefined);

  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  // // Optimized session restore with sessionStorage caching
  // useEffect(() => {
  //   const store = storeRef.current;
  //   if (!store) return;

  //   const initAuth = async () => {
  //     const state = store.getState();

  //     // Skip if already authenticated with token in memory
  //     if (state.auth.isAuthenticated && !!state.auth.accessToken) {
  //       console.log('[Session Restore] Already authenticated, skipping');
  //       return;
  //     }

  //     // Check if we have refreshToken cookie before attempting restore
  //     // If no refreshToken cookie, user was never logged in or explicitly logged out
  //     const hasRefreshToken = document.cookie.includes('refreshToken=');

  //     if (!hasRefreshToken) {
  //       console.log('[Session Restore] No refreshToken cookie, skipping session restore');
  //       store.dispatch(setLoading(false));
  //       return;
  //     }

  //     // Try to restore from sessionStorage first (instant UI)
  //     const cachedUser = loadUserFromSession();

  //     if (!cachedUser) {
  //       // No cached user but has refreshToken - this shouldn't happen normally
  //       // Try to get fresh session anyway
  //       console.log('[Session Restore] No cached user but has refreshToken, fetching fresh session');
  //     } else {
  //       // We have cached user data - restore it immediately for instant UI
  //       console.log('[Session Restore] 📦 Restoring from sessionStorage cache');
  //       // DON'T set isAuthenticated yet - wait for session validation
  //       store.dispatch(
  //         setCredentials({
  //           user: cachedUser,
  //           accessToken: '', // Will be fetched from refresh endpoint
  //         })
  //       );
  //     }

  //     // Now validate the session by calling refresh endpoint
  //     // (refreshToken is in httpOnly cookie, sent automatically)
  //     try {
  //       console.log('[Session Restore] 🔄 Validating session with refresh endpoint...');
  //       const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/refresh`, {
  //         method: 'POST',
  //         credentials: 'include', // Send httpOnly cookie
  //       });

  //       if (!response.ok) {
  //         // Session is invalid (expired or no refresh token)
  //         throw new Error(`Refresh failed with status ${response.status}`);
  //       }

  //       const result = await response.json();
  //       console.log('[Session Restore] ✅ Session validated');

  //       // Fetch fresh user data with new access token
  //       const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/me`, {
  //         headers: {
  //           Authorization: `Bearer ${result.data.tokens.access.token}`,
  //         },
  //         credentials: 'include',
  //       });

  //       if (userResponse.ok) {
  //         const userData = await userResponse.json();
  //         console.log('[Session Restore] 👤 Fresh user data fetched');

  //         // Update Redux with validated data + new token
  //         // This will also update sessionStorage via reducer
  //         store.dispatch(
  //           setCredentials({
  //             user: userData.data.user,
  //             accessToken: result.data.tokens.access.token,
  //           })
  //         );

  //         console.log('[Session Restore] ✅ Session restored and validated successfully');
  //       } else {
  //         throw new Error('Failed to fetch user data');
  //       }
  //     } catch (error) {
  //       console.error('[Session Restore] ❌ Session validation failed:', error);

  //       // Clear everything on failure
  //       store.dispatch(logout());

  //       // DON'T redirect here - let the user stay on current page
  //       // If they try to access protected content, middleware will handle it
  //       // Or their next API call will trigger the redirect from api.ts
  //       console.log('[Session Restore] Session expired, user will be redirected on next action');
  //     } finally {
  //       // Always set loading to false
  //       store.dispatch(setLoading(false));
  //     }
  //   };

  //   initAuth();
  // }, []);

  return (
    <Provider store={storeRef.current}>
      <AuthInitializer>{children}</AuthInitializer>
    </Provider>
  );
}
