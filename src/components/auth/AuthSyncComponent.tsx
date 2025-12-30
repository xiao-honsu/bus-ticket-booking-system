'use client';

import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { setAccessToken, setUser, logout } from '@/lib/store/features/auth/authSlice';
import { User } from '@/lib/types';
import { clearAuthCookies, deleteCookie } from '@/lib/utils/cookies';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

/**
 * AuthSyncComponent - Background authentication synchronization
 *
 * This component runs in the background without blocking UI rendering.
 * It syncs the Redux auth state with the backend:
 * 1. If user info exists from SSR (via user-info cookie), fetch fresh access token
 * 2. Fetch full user data from /auth/me endpoint
 * 3. Update Redux state with complete user information
 *
 * Key benefits:
 * - NO loading spinner - content renders immediately from SSR
 * - NO hydration mismatch - server and client start with same state from cookie
 * - Background sync updates state progressively without user noticing
 */
export function AuthSyncComponent() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const syncedRef = useRef(false);

  useEffect(() => {
    // Skip if already synced in this session
    if (syncedRef.current) return;

    // Skip if no initial auth state (user not logged in)
    if (!isAuthenticated || !user?.id) {
      syncedRef.current = true;
      return;
    }

    // Skip if we already have accessToken and full user data
    if (accessToken && user?.email) {
      syncedRef.current = true;
      return;
    }

    const syncAuth = async () => {
      try {
        // Step 1: Refresh tokens to get new accessToken
        const refreshUrl = new URL('/api/v1/auth/refresh', BASE_URL).toString();
        const refreshRes = await fetch(refreshUrl, {
          method: 'POST',
          credentials: 'include', // Send httpOnly refreshToken cookie
        });

        if (!refreshRes.ok) {
          // Refresh failed - token might be expired or invalid
          console.warn('[AuthSync] Token refresh failed, logging out');
          handleAuthFailure();
          return;
        }

        const refreshData = await refreshRes.json();
        const newAccessToken = refreshData?.data?.tokens?.access?.token;

        if (!newAccessToken) {
          console.warn('[AuthSync] No access token in refresh response');
          handleAuthFailure();
          return;
        }

        // Update accessToken in Redux
        dispatch(setAccessToken(newAccessToken));

        // Step 2: Fetch full user data
        const meUrl = new URL('/api/v1/auth/me', BASE_URL).toString();
        const meRes = await fetch(meUrl, {
          headers: {
            Authorization: `Bearer ${newAccessToken}`,
          },
          credentials: 'include',
        });

        if (meRes.ok) {
          const userData = await meRes.json();
          const fullUser = userData.data?.user as User;

          if (fullUser) {
            // Update Redux with full user data
            dispatch(setUser(fullUser));
          }
        } else {
          console.warn('[AuthSync] Failed to fetch user data');
          // Don't logout here - we still have basic info from cookie
        }
      } catch (error) {
        // Network error or other issue
        console.warn('[AuthSync] Sync failed:', error);
        // Don't logout on network errors - user might be offline
      } finally {
        syncedRef.current = true;
      }
    };

    const handleAuthFailure = () => {
      dispatch(logout());
      clearAuthCookies();
      deleteCookie('user-info');
      syncedRef.current = true;
    };

    // Start sync in background
    syncAuth();
  }, [dispatch, user, accessToken, isAuthenticated]);

  // This component renders nothing - it's purely for background sync
  return null;
}
