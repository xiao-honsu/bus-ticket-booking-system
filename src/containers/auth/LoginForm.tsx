'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { useLoginMutation } from '@/lib/store/services/api';
import { useAppDispatch } from '@/lib/hooks';
import { setCredentials } from '@/lib/store/features/auth/authSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ApiErrorResponse } from '@/lib/types';
import { setUserInfoCookie } from '@/lib/utils/cookies';

const loginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: params.get('email') || '',
      password: '',
    },
  });

  const emailValue = form.watch('email');

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const resultData = await login(data).unwrap();

      console.log('Login result:', resultData);

      // Login successful
      // - refreshToken is set in httpOnly cookie by backend
      // - accessToken is stored in Redux state (memory)
      // - userRole is set in cookie by backend (for middleware access control)

      // Set user-info cookie for SSR hydration on next navigation
      setUserInfoCookie({
        id: resultData.user.id,
        role: resultData.user.role,
        name: resultData.user.name,
        email: resultData.user.email,
      });

      dispatch(
        setCredentials({
          user: resultData.user,
          accessToken: resultData.tokens.access.token,
        })
      );

      toast.success('Login successful!');

      // Check for redirect parameter (from protected route middleware)
      const redirectUrl = params.get('redirect');

      if (redirectUrl) {
        // Redirect to the originally requested page
        router.push(redirectUrl);
      } else {
        // Default redirect based on role
        if (resultData.user.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (error: any) {
      console.log('Login error:', error);

      // RTK Query error format: { status: number, data: { message, emailNotVerified?, ... } }
      const errorMessage = error?.message || 'Login failed';
      const errorStatus = error?.code;

      // Handle different error scenarios
      if (error?.data?.emailNotVerified) {
        // Email not verified - special handling
        const toastId = toast.error(error.data.message || 'Please verify your email before logging in.', {
          duration: Infinity,
          action: {
            label: 'Resend Email',
            onClick: async (event) => {
              event.preventDefault();
              const loadingToast = toast.loading('Sending verification email...');

              try {
                const response = await fetch(
                  `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/resend-verification-email`,
                  {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      email: data.email,
                    }),
                  }
                );

                toast.dismiss(loadingToast);

                if (response.ok) {
                  toast.dismiss(toastId);
                  toast.success('Verification email sent! Please check your inbox.', {
                    duration: 5000,
                  });
                } else {
                  toast.error('Failed to resend email. Please try again.', {
                    duration: 5000,
                  });
                }
              } catch (err) {
                toast.dismiss(loadingToast);
                toast.error('Failed to resend email. Please try again.', {
                  duration: 5000,
                });
              }
            },
          },
          cancel: {
            label: 'Dismiss',
            onClick: () => {
              toast.dismiss(toastId);
            },
          },
        });
      } else if (errorStatus === 401) {
        // Unauthorized - wrong credentials
        toast.error('Invalid email or password. Please try again.');
      } else if (errorStatus === 403) {
        // Forbidden - account locked or suspended
        toast.error(errorMessage || 'Account is locked or suspended. Please contact support.');
      } else if (errorStatus === 500) {
        // Server error
        toast.error('Server error. Please try again later.');
      } else if (errorMessage) {
        // Backend returned specific error message
        toast.error(errorMessage, { duration: 5000 });
      } else {
        // Generic error
        toast.error('Login failed. Please check your credentials.');
      }
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth endpoint
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/google`;
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Login</CardTitle>
        <CardDescription className="text-center">Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="your@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        {...field}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <Button onClick={handleGoogleLogin} variant="outline" type="button" className="w-full">
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="text-center">
          <Link
            href={{
              pathname: '/auth/forgot-password',
              query: emailValue ? { email: emailValue } : undefined,
            }}
            className="text-sm text-primary hover:underline"
          >
            Forgot Password?
          </Link>
        </div>
        <p className="text-sm text-muted-foreground text-center">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="text-primary hover:underline">
            Register
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
