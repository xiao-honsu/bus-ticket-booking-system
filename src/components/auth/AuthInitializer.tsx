'use client';

import { useAppDispatch } from '@/lib/hooks';
import { setAccessToken, setCredentials, setUser } from '@/lib/store/features/auth/authSlice';
import { User } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const [isChecking, setIsChecking] = useState(true);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const refreshUrl = new URL('/api/v1/auth/refresh', BASE_URL).toString();

    // Skip auth initialization when using mock API
    if (!refreshUrl) {
      setIsChecking(false);
      return;
    }

    fetch(refreshUrl, {
      method: 'POST',
      credentials: 'include',
    })
      .then(async (response) => {
        if (response.ok) {
          const data = await response.json();
          dispatch(setAccessToken(data?.data?.tokens?.access?.token));

          const meUrl = new URL('/api/v1/auth/me', BASE_URL).toString();
          if (!meUrl) {
            setIsChecking(false);
            return;
          }

          const responseMe = await fetch(meUrl, {
            headers: {
              Authorization: `Bearer ${data?.data?.tokens?.access?.token}`,
            },
            credentials: 'include',
          });
          if (responseMe.ok) {
            const userData = await responseMe.json();
            dispatch(setUser(userData.data?.user as User));
          }
        }
        setIsChecking(false);
      })
      .catch((error) => {
        // Handle network errors gracefully (e.g., backend not running)
        console.warn('Auth refresh failed:', error.message);
        setIsChecking(false);
      });
  }, [dispatch]);

  if (isChecking) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
