'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PaymentMethods() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Phương thức thanh toán</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-3 p-4 border rounded-lg bg-gray-50">
          <span className="text-2xl mr-3">💳</span>
          <div className="flex-1">
            <div className="font-medium">PayOS</div>
            <div className="text-sm text-gray-500">Thanh toán trực tuyến qua PayOS</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
