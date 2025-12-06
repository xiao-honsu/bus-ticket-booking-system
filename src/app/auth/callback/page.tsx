'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch } from '@/lib/hooks';
import { setCredentials } from '@/lib/store/features/auth/authSlice';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refreshToken');

    if (token && refreshToken) {
      try {
        // Store tokens in cookies
        document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
        document.cookie = `refreshToken=${refreshToken}; path=/; max-age=${60 * 60 * 24 * 30}`; // 30 days

        // Decode token to get user info (simple base64 decode of JWT payload)
        const payload = JSON.parse(atob(token.split('.')[1]));

        // Extract user role and store it in cookies for middleware
        const userRole = payload.role || 'user';
        document.cookie = `userRole=${userRole}; path=/; max-age=${60 * 60 * 24 * 7}`;

        // Update Redux state
        dispatch(
          setCredentials({
            user: payload.user || { id: payload.sub, role: userRole },
            tokens: {
              access: { token },
              refresh: { token: refreshToken },
            },
          })
        );

        // Redirect to dashboard
        router.push('/dashboard');
      } catch (error) {
        console.error('Error processing OAuth callback:', error);
        router.push('/auth/login?error=authentication_failed');
      }
    } else {
      // Redirect to login on error
      router.push('/auth/login?error=authentication_failed');
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
