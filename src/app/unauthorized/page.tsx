'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert, Home, LayoutDashboard, ArrowLeft, Lock } from 'lucide-react';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-background via-red-50/30 to-background dark:from-background dark:via-red-950/10 dark:to-background px-4 py-8">
      {/* Background Decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-red-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-red-400/10 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md relative z-10 border-2 border-red-200 dark:border-red-900 shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 relative">
            <div className="absolute inset-0 bg-red-400/20 rounded-full blur-xl animate-pulse" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-red-100 to-red-200 dark:from-red-900/50 dark:to-red-800/50">
              <ShieldAlert className="h-10 w-10 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-red-600 dark:text-red-400">Access Denied</CardTitle>
          <CardDescription className="text-base mt-2">You don't have permission to access this page</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="bg-red-50 dark:bg-red-950/50 rounded-lg p-4 border border-red-200 dark:border-red-800">
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-red-800 dark:text-red-300">This area is restricted</p>
                <p className="text-red-600/80 dark:text-red-400/80 mt-1">
                  Administrator privileges are required to view this content.
                </p>
              </div>
            </div>
          </div>

          <p className="text-sm text-center text-muted-foreground">
            If you believe this is an error, please contact your system administrator.
          </p>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pt-2">
          <Button
            onClick={() => router.push('/')}
            className="w-full bg-linear-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white"
            size="lg"
          >
            <Home className="h-4 w-4 mr-2" />
            Go to Home
          </Button>
          <div className="grid grid-cols-2 gap-3 w-full">
            <Button onClick={() => router.back()} variant="outline" className="border-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
            <Button onClick={() => router.push('/dashboard')} variant="outline" className="border-2">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
