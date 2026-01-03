'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { checkPaymentStatus } from '@/lib/services/payment.service';
import { useAppSelector } from '@/lib/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, Loader2, AlertCircle, Receipt, CreditCard, ArrowRight, Search } from 'lucide-react';
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
      <div className="flex items-center justify-center min-h-screen bg-background px-4">
        <Card className="w-full max-w-md border-border bg-card/60 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
              <Loader2 className="relative h-12 w-12 animate-spin text-primary mb-4" />
            </div>
            <p className="text-lg font-medium text-card-foreground">Checking payment status...</p>
            <p className="text-sm text-muted-foreground mt-2">Please wait a moment</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background px-4">
        <Card className="w-full max-w-md border-destructive/50 bg-card/60 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-destructive/20 rounded-full blur-xl" />
              <AlertCircle className="relative h-16 w-16 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold mb-2 text-card-foreground">An Error Occurred</h1>
            <p className="text-muted-foreground text-center mb-6">{error}</p>
            <div className="flex gap-3 w-full">
              <Button onClick={() => router.push('/dashboard')} variant="outline" className="flex-1">
                Go to Dashboard
              </Button>
              <Button onClick={() => router.push('/search')} className="flex-1">
                <Search className="mr-2 h-4 w-4" />
                Search Trip
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status?.booking?.paymentStatus === 'completed') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background px-4 py-8">
        <Card className="w-full max-w-2xl border-green-500/30 bg-card/60 backdrop-blur-sm shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-green-500/30 rounded-full blur-xl animate-pulse" />
                <CheckCircle2 className="relative h-20 w-20 text-green-500" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold bg-linear-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
              Payment Successful!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <p className="text-center text-green-600 dark:text-green-400">
                Your order has been successfully paid. Ticket information has been sent via email.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-lg text-card-foreground">Order Information</h2>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Order Code</p>
                  <Badge variant="secondary" className="font-mono">
                    {orderCode}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Booking ID</p>
                  <Badge variant="outline" className="font-mono text-xs">
                    {status.booking.id}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className="bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Paid
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="font-bold text-xl text-primary">
                    {status.booking.totalAmount.toLocaleString('vi-VN')} VNĐ
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <Button onClick={() => router.push('/dashboard')} className="flex-1 group" size="lg">
                <CreditCard className="mr-2 h-4 w-4" />
                View Booking Details
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button onClick={() => router.push('/search')} variant="outline" className="flex-1" size="lg">
                <Search className="mr-2 h-4 w-4" />
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
    <div className="flex items-center justify-center min-h-screen bg-background px-4">
      <Card className="w-full max-w-md border-yellow-500/30 bg-card/60 backdrop-blur-sm">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-yellow-500/20 rounded-full blur-xl animate-pulse" />
            <Loader2 className="relative h-12 w-12 animate-spin text-yellow-500" />
          </div>
          <h1 className="text-2xl font-bold mb-2 text-card-foreground">Processing Payment</h1>
          <p className="text-muted-foreground text-center mb-6">
            Your transaction is being processed. Please wait a moment.
          </p>
          <Badge variant="secondary" className="font-mono">
            Order Code: {orderCode}
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentSuccessPage() {
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
      <SuccessPageContent />
    </Suspense>
  );
}
