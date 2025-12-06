'use client';

import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { setUser } from '@/lib/store/features/auth/authSlice';

/**
 * Hook to sync user data when we have tokens but no user data
 * This happens after page reload when we restore tokens from cookies
 */
export function useAuthSync() {
  const { isAuthenticated, token, user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  useEffect(() => {
    // If authenticated with token but no user data, fetch it
    if (isAuthenticated && token && !user) {
      const fetchUser = async () => {
        try {
          // Decode JWT to get user ID
          const tokenParts = token.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            const userId = payload.sub;

            // Fetch user data
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/v1/users/${userId}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (response.ok) {
              const userData = await response.json();
              dispatch(setUser(userData));
            }
          }
        } catch (error) {
          console.error('Failed to fetch user data:', error);
        }
      };

      fetchUser();
    }
  }, [isAuthenticated, token, user, dispatch]);
}
