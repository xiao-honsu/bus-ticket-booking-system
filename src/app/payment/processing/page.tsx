'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, CreditCard } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

function ProcessingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const orderCode = searchParams.get('orderCode');
  const status = searchParams.get('status');
  const cancel = searchParams.get('cancel');

  useEffect(() => {
    // Determine where to redirect based on payment result
    if (cancel === 'true' || status === 'CANCELLED') {
      // Payment was cancelled
      router.push(`/payment/cancel?orderCode=${orderCode}`);
    } else if (orderCode) {
      // Payment might be successful, check status
      router.push(`/payment/success?orderCode=${orderCode}`);
    } else {
      // No order code, something went wrong
      router.push('/search');
    }
  }, [orderCode, status, cancel, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4">
      <Card className="w-full max-w-md border-primary/30 bg-card/60 backdrop-blur-sm shadow-lg">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
            <div className="relative">
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
              <CreditCard className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2 text-card-foreground">Processing Payment</h1>
          <p className="text-muted-foreground text-center mb-4">Please wait, we are verifying your payment status...</p>
          {orderCode && (
            <Badge variant="secondary" className="font-mono">
              Order: {orderCode}
            </Badge>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentProcessingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
            <Loader2 className="relative h-12 w-12 animate-spin text-primary" />
          </div>
        </div>
      }
    >
      <ProcessingContent />
    </Suspense>
  );
}
