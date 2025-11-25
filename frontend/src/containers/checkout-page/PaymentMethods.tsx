'use client';

import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { setPayment } from '@/lib/store/features/booking/bookingSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface PaymentMethod {
  id: 'momo' | 'zalopay' | 'payos' | 'card' | 'bank_transfer';
  name: string;
  icon: string;
  description: string;
}

export default function PaymentMethods() {
  const dispatch = useAppDispatch();
  const payment = useAppSelector((state) => state.booking.payment);
  const tripId = useAppSelector((state) => state.booking.tripId);
  const selectedSeats = useAppSelector((state) => state.booking.selectedSeats);

  const methods: PaymentMethod[] = [
    { id: 'momo', name: 'MoMo', icon: '💳', description: 'Pay with MoMo e-wallet' },
    { id: 'zalopay', name: 'ZaloPay', icon: '💰', description: 'Pay with ZaloPay' },
    { id: 'payos', name: 'PayOS', icon: '💳', description: 'Pay with PayOS' },
    { id: 'card', name: 'Credit/Debit Card', icon: '💳', description: 'Visa, Mastercard, etc.' },
    { id: 'bank_transfer', name: 'Bank Transfer', icon: '🏦', description: 'Direct bank transfer' },
  ];

  const handlePaymentChange = (methodId: string) => {
    // Calculate amount from trip data
    const amount = 0; // Will be calculated in checkout page
    dispatch(
      setPayment({
        method: methodId as PaymentMethod['id'],
        amount,
      })
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Method</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={payment?.method || 'momo'}
          onValueChange={handlePaymentChange}
          className="space-y-3"
        >
          {methods.map((method) => (
            <div
              key={method.id}
              className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
            >
              <RadioGroupItem value={method.id} id={method.id} />
              <Label
                htmlFor={method.id}
                className="flex items-center flex-1 cursor-pointer"
              >
                <span className="text-2xl mr-3">{method.icon}</span>
                <div className="flex-1">
                  <div className="font-medium">{method.name}</div>
                  <div className="text-sm text-gray-500">{method.description}</div>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
