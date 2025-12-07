'use client';

import { useRef, useEffect } from 'react';
import { Provider } from 'react-redux';
import { makeStore, AppStore } from '@/lib/store';
import { setCredentials, setLoading, logout, loadUserFromSession } from '@/lib/store/features/auth/authSlice';
import { toast } from 'sonner';

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore | undefined>(undefined);

  // Initialize store ref once - using == null pattern as recommended by React
  if (storeRef.current == null) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore();
  }

  // Optimized session restore with sessionStorage caching
  useEffect(() => {
    const initAuth = async () => {
      const store = storeRef.current;
      if (!store) return;

      const state = store.getState();

      // Skip if already authenticated with token in memory
      if (state.auth.isAuthenticated && state.auth.accessToken) {
        console.log('[Session Restore] Already authenticated, skipping');
        return;
      }

      // Try to restore from sessionStorage first (instant UI)
      const cachedUser = loadUserFromSession();

      if (!cachedUser) {
        // No cached user = user was never logged in or logged out
        // Skip refresh attempt to avoid unnecessary API call and errors
        console.log('[Session Restore] No cached user found, skipping session restore');
        store.dispatch(setLoading(false));
        return;
      }

      // We have cached user data - restore it immediately for instant UI
      console.log('[Session Restore] 📦 Restoring from sessionStorage cache');
      store.dispatch(
        setCredentials({
          user: cachedUser,
          accessToken: '', // Will be fetched from refresh endpoint
        })
      );
      // Set loading false to show cached user immediately
      store.dispatch(setLoading(false));

      // Now validate the session in background by calling refresh endpoint
      // (refreshToken is in httpOnly cookie, sent automatically)
      try {
        console.log('[Session Restore] 🔄 Validating session with refresh endpoint...');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/refresh-tokens`, {
          method: 'POST',
          credentials: 'include', // Send httpOnly cookie
        });

        if (!response.ok) {
          // Session is invalid (expired or no refresh token)
          throw new Error(`Refresh failed with status ${response.status}`);
        }

        const result = await response.json();
        console.log('[Session Restore] ✅ Session validated');

        // Fetch fresh user data with new access token
        const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/me`, {
          headers: {
            Authorization: `Bearer ${result.data.tokens.access.token}`,
          },
          credentials: 'include',
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          console.log('[Session Restore] 👤 Fresh user data fetched');

          // Update Redux with validated data + new token
          // This will also update sessionStorage via reducer
          store.dispatch(
            setCredentials({
              user: userData.data.user,
              accessToken: result.data.tokens.access.token,
            })
          );

          console.log('[Session Restore] ✅ Session restored and validated successfully');
        } else {
          throw new Error('Failed to fetch user data');
        }
      } catch (error) {
        console.error('[Session Restore] ❌ Session validation failed:', error);

        // Clear everything on failure
        store.dispatch(logout());

        // Show error toast since user had cached data (they expect to be logged in)
        toast.error('Session expired. Please login again.');
      }
    };

    initAuth();
  }, []);

  return <Provider store={storeRef.current}>{children}</Provider>;
}
