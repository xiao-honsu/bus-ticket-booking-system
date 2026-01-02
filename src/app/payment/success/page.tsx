'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { checkPaymentStatus } from '@/lib/services/payment.service';
import { useAppSelector } from '@/lib/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentStatus {
  paymentInfo: {
    orderCode: number;
    amount: number;
    status: string;
  };
  booking: {
    id: string;
    status: string;
    paymentStatus: string;
    totalAmount: number;
  } | null;
}

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const [status, setStatus] = useState<PaymentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const orderCode = searchParams.get('orderCode');

  useEffect(() => {
    if (!orderCode) {
      setError('Order code does not exist');
      setLoading(false);
      return;
    }

    const checkStatus = async () => {
      try {
        // Token is optional - works for both authenticated and guest users
        const result = await checkPaymentStatus(orderCode, accessToken || undefined);
        setStatus(result);

        if (result.booking?.paymentStatus === 'completed') {
          toast.success('Payment successful!');
        } else {
          // Still processing, check again after delay
          setTimeout(() => {
            checkStatus();
          }, 2000);
        }
      } catch (err: any) {
        console.error('Error checking payment status:', err);
        setError(err.message || 'Unable to check payment status');
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [orderCode, accessToken]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
            <p className="text-lg font-medium">Checking payment status...</p>
            <p className="text-sm text-gray-500 mt-2">Please wait a moment</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-16 w-16 text-red-600 mb-4" />
            <h1 className="text-2xl font-bold mb-2">An Error Occurred</h1>
            <p className="text-gray-600 text-center mb-6">{error}</p>
            <div className="flex gap-4">
              <Button onClick={() => router.push('/dashboard')} variant="outline">
                Go to Dashboard
              </Button>
              <Button onClick={() => router.push('/search')}>Search New Trip</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status?.booking?.paymentStatus === 'completed') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-20 w-20 text-green-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-green-600">Payment Successful!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-center text-green-800">
                Your order has been successfully paid. Ticket information has been sent via email.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="font-semibold text-lg border-b pb-2">Order Information</h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-gray-500">Order Code</p>
                  <p className="font-medium">{orderCode}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Booking ID</p>
                  <p className="font-medium">{status.booking.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium text-green-600">Paid</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="font-bold text-xl">{status.booking.totalAmount.toLocaleString('vi-VN')} VNĐ</p>
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <Button onClick={() => router.push(`/dashboard`)} className="flex-1" size="lg">
                View Booking Details
              </Button>
              <Button onClick={() => router.push('/search')} variant="outline" className="flex-1" size="lg">
                Book New Ticket
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Payment still processing
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-yellow-600 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Processing Payment</h1>
          <p className="text-gray-600 text-center mb-6">Your transaction is being processed. Please wait a moment.</p>
          <p className="text-sm text-gray-500">Order Code: {orderCode}</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        </div>
      }
    >
      <SuccessPageContent />
    </Suspense>
  );
}
