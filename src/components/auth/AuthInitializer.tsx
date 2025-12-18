'use client';

import { useAppDispatch } from '@/lib/hooks';
import { setAccessToken, setCredentials, setUser } from '@/lib/store/features/auth/authSlice';
import { User } from '@/lib/types';
import { useEffect, useState } from 'react';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Build URL helper - handle both absolute URLs and relative paths
const buildUrl = (path: string) => {
  if (BASE_URL.startsWith('http')) {
    return new URL(path, BASE_URL).toString();
  }
  // For relative paths like '/api/mock', skip auth calls since mock doesn't have auth endpoints
  return null;
};

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const [isChecking, setIsChecking] = useState(true);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const refreshUrl = buildUrl('/api/v1/auth/refresh');

    // Skip auth initialization when using mock API
    if (!refreshUrl) {
      setIsChecking(false);
      return;
    }

    fetch(refreshUrl, {
      method: 'POST',
      credentials: 'include',
    }).then(async (response) => {
      if (response.ok) {
        const data = await response.json();
        dispatch(setAccessToken(data?.data?.tokens?.access?.token));

        const meUrl = buildUrl('/api/v1/auth/me');
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
    });
  }, [dispatch]);

  if (isChecking) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  return <>{children}</>;
}
