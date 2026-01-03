'use client';

import { Suspense } from 'react';
import LoginForm from '@/containers/auth/LoginForm';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

function LoginSkeleton() {
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="space-y-2">
        <Skeleton className="h-8 w-32 mx-auto" />
        <Skeleton className="h-4 w-48 mx-auto" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <main className="container mx-auto px-4 py-16">
      <Suspense fallback={<LoginSkeleton />}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
