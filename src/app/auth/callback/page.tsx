'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch } from '@/lib/hooks';
import { setCredentials } from '@/lib/store/features/auth/authSlice';
import { setUserInfoCookie } from '@/lib/utils/cookies';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const success = searchParams.get('success');
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      console.error('OAuth error:', error);
      router.push(`/auth/login?error=${error}`);
      return;
    }

    if (success === 'true' && token) {
      // refreshToken is already set in httpOnly cookie by backend
      // accessToken is passed in URL and will be stored in memory
      const fetchUserData = async () => {
        try {
          const response = await fetch(new URL('/api/v1/auth/me', process.env.NEXT_PUBLIC_API_URL).toString(), {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            credentials: 'include',
          });

          if (response.ok) {
            const data = await response.json();
            const user = data.data.user;

            // Set user-info cookie for SSR hydration on next navigation
            setUserInfoCookie({
              id: user.id,
              role: user.role,
              name: user.name,
              email: user.email,
            });

            dispatch(
              setCredentials({
                user: user,
                accessToken: token,
              })
            );
            router.push('/dashboard');
          } else {
            throw new Error('Failed to fetch user data');
          }
        } catch (err) {
          console.error('Error fetching user data:', err);
          router.push('/auth/login?error=auth_failed');
        }
      };

      fetchUserData();
    } else {
      // No success parameter, redirect to login
      router.push('/auth/login?error=invalid_callback');
    }
  }, [searchParams, dispatch, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
        <p className="text-lg">Authenticating with Google...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <p className="text-lg">Loading...</p>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
