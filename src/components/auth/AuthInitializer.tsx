'use client';

import { useAppDispatch } from '@/lib/hooks';
import { setAccessToken, setCredentials, setUser } from '@/lib/store/features/auth/authSlice';
import { User } from '@/lib/types';
import { useEffect, useState } from 'react';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const [isChecking, setIsChecking] = useState(true);
  const dispatch = useAppDispatch();

  useEffect(() => {
    fetch(new URL('api/v1/auth/refresh', BASE_URL).toString(), {
      method: 'POST',
      credentials: 'include',
    }).then(async (response) => {
      if (response.ok) {
        const data = await response.json();
        dispatch(setAccessToken(data?.data?.tokens?.access?.token));

        const responseMe = await fetch(new URL('api/v1/auth/me', BASE_URL).toString(), {
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
