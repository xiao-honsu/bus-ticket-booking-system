'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2, Mail } from 'lucide-react';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('No verification token provided. Please check your email for the verification link.');
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/verify-email?token=${token}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          setStatus('success');
          setMessage('Your email has been verified successfully! You can now log in to your account.');

          // Redirect to login page after 3 seconds
          setTimeout(() => {
            router.push('/auth/login?verified=true');
          }, 3000);
        } else {
          const data = await response.json();
          setStatus('error');
          setMessage(data.message || 'Email verification failed. The link may be expired or invalid.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('An error occurred while verifying your email. Please try again later.');
        console.error('Email verification error:', error);
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === 'loading' && <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />}
            {status === 'success' && <CheckCircle2 className="h-16 w-16 text-green-500" />}
            {status === 'error' && <XCircle className="h-16 w-16 text-red-500" />}
          </div>
          <CardTitle className="text-2xl">
            {status === 'loading' && 'Verifying Your Email'}
            {status === 'success' && 'Email Verified!'}
            {status === 'error' && 'Verification Failed'}
          </CardTitle>
          <CardDescription className="text-base mt-2">{message}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {status === 'loading' && (
            <p className="text-center text-sm text-muted-foreground">
              Please wait while we verify your email address...
            </p>
          )}

          {status === 'success' && (
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                You will be redirected to the login page in a few seconds.
              </p>
              <Button onClick={() => router.push('/auth/login')} className="w-full">
                Go to Login
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
                <p className="font-semibold mb-2">Common issues:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Verification link has expired (24 hours validity)</li>
                  <li>Link has already been used</li>
                  <li>Invalid or malformed token</li>
                </ul>
              </div>

              <div className="flex flex-col gap-2">
                <Button onClick={() => router.push('/auth/register')} className="w-full">
                  <Mail className="mr-2 h-4 w-4" />
                  Register Again
                </Button>
                <Button onClick={() => router.push('/auth/login')} variant="outline" className="w-full">
                  Back to Login
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <main className="container mx-auto px-4 py-16">
      <Suspense
        fallback={
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Loader2 className="h-16 w-16 text-blue-600 animate-spin" />
              </div>
              <CardTitle>Verifying Email...</CardTitle>
              <CardDescription>Please wait while we verify your email address</CardDescription>
            </CardHeader>
          </Card>
        }
      >
        <VerifyEmailContent />
      </Suspense>
    </main>
  );
}
