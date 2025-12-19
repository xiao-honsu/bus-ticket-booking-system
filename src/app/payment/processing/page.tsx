'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

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
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-16 w-16 animate-spin text-blue-600 mb-6" />
          <h1 className="text-2xl font-bold mb-2">Đang xử lý thanh toán</h1>
          <p className="text-gray-600 text-center">
            Vui lòng đợi, chúng tôi đang kiểm tra trạng thái thanh toán của bạn...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentProcessingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        </div>
      }
    >
      <ProcessingContent />
    </Suspense>
  );
}
