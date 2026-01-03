'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { XCircle, Loader2, ArrowLeft, Search, Clock, AlertTriangle, Receipt } from 'lucide-react';

function CancelPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);

  const orderCode = searchParams.get('orderCode');
  const bookingId = searchParams.get('bookingId');

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Separate effect to handle redirect when countdown reaches 0
  useEffect(() => {
    if (countdown === 0) {
      router.push('/search');
    }
  }, [countdown, router]);

  const handleTryAgain = () => {
    if (bookingId) {
      // Try payment again for the same booking
      router.push(`/checkout?bookingId=${bookingId}`);
    } else {
      // Go back to previous page
      router.back();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4 py-8">
      <Card className="w-full max-w-2xl border-destructive/30 bg-card/60 backdrop-blur-sm shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-destructive/30 rounded-full blur-xl" />
              <XCircle className="relative h-20 w-20 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-linear-to-r from-destructive to-red-400 bg-clip-text text-transparent">
            Payment Cancelled
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
            <p className="text-center text-destructive dark:text-red-400">
              Your payment transaction has been cancelled. No charges were made to your account.
            </p>
          </div>

          {orderCode && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-lg text-card-foreground">Transaction Information</h2>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Order Code</p>
                  <Badge variant="secondary" className="font-mono">
                    {orderCode}
                  </Badge>
                </div>
                {bookingId && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Booking ID</p>
                    <Badge variant="outline" className="font-mono text-xs">
                      {bookingId}
                    </Badge>
                  </div>
                )}
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant="destructive" className="bg-destructive/20 text-destructive border-destructive/30">
                    <XCircle className="mr-1 h-3 w-3" />
                    Cancelled
                  </Badge>
                </div>
              </div>
            </div>
          )}

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-card-foreground">Important Note</p>
              <p className="text-sm text-muted-foreground mt-1">
                Your selected seats are being held for a limited time. Please complete payment before the time expires
                to secure your reservation.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handleTryAgain} className="flex-1 group" size="lg">
                <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Try Payment Again
              </Button>
              <Button onClick={() => router.push('/search')} variant="outline" className="flex-1" size="lg">
                <Search className="mr-2 h-4 w-4" />
                Search New Trip
              </Button>
            </div>

            <Button
              onClick={() => router.push('/dashboard')}
              variant="ghost"
              className="w-full text-muted-foreground hover:text-card-foreground"
            >
              Go to Dashboard
            </Button>
          </div>

          <div className="text-center pt-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50">
              <Clock className="h-4 w-4 text-muted-foreground animate-pulse" />
              <span className="text-sm text-muted-foreground">
                Redirecting to search in <span className="font-semibold text-primary">{countdown}</span> seconds...
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentCancelPage() {
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
      <CancelPageContent />
    </Suspense>
  );
}
