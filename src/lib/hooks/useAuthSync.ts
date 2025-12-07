'use client';

import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { setUser } from '@/lib/store/features/auth/authSlice';

/**
 * Hook to sync user data when we have accessToken but no user data
 * This happens after page reload when we restore token from refresh
 */
export function useAuthSync() {
  const { isAuthenticated, accessToken, user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  useEffect(() => {
    // If authenticated with accessToken but no user data, fetch it
    if (isAuthenticated && accessToken && !user) {
      const fetchUser = async () => {
        try {
          // Fetch user data using /auth/me endpoint
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/v1/auth/me`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            credentials: 'include',
          });

          if (response.ok) {
            const result = await response.json();
            dispatch(setUser(result.data.user));
          }
        } catch (error) {
          console.error('Failed to fetch user data:', error);
        }
      };

      fetchUser();
    }
  }, [isAuthenticated, accessToken, user, dispatch]);
}
