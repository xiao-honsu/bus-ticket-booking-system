'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, Loader2, ArrowLeft, Search } from 'lucide-react';

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
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <XCircle className="h-20 w-20 text-red-600" />
          </div>
          <CardTitle className="text-3xl font-bold text-red-600">Payment Cancelled</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-center text-red-800">
              Your payment transaction has been cancelled. No charges were made to your account.
            </p>
          </div>

          {orderCode && (
            <div className="space-y-2">
              <h2 className="font-semibold text-lg border-b pb-2">Transaction Information</h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-gray-500">Order Code</p>
                  <p className="font-medium">{orderCode}</p>
                </div>
                {bookingId && (
                  <div>
                    <p className="text-sm text-gray-500">Booking ID</p>
                    <p className="font-medium">{bookingId}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium text-red-600">Cancelled</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Your selected seats are being held for a limited time. Please complete payment
              before the time expires to secure your reservation.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handleTryAgain} className="flex-1" size="lg">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Try Payment Again
              </Button>
              <Button onClick={() => router.push('/search')} variant="outline" className="flex-1" size="lg">
                <Search className="mr-2 h-4 w-4" />
                Search New Trip
              </Button>
            </div>

            <Button onClick={() => router.push('/dashboard')} variant="ghost" className="w-full">
              Go to Dashboard
            </Button>
          </div>

          <div className="text-center text-sm text-gray-500">
            Automatically redirecting to search page in {countdown} seconds...
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
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        </div>
      }
    >
      <CancelPageContent />
    </Suspense>
  );
}
