'use client';

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { setPromotion } from '@/lib/store/features/booking/bookingSlice';
import { useValidatePromotionMutation, useGetTripQuery } from '@/lib/store/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Tag, X } from 'lucide-react';

export default function PromoCodeInput() {
  const dispatch = useAppDispatch();
  const [promoCode, setPromoCode] = useState('');
  const promotion = useAppSelector((state) => state.booking.promotion);
  const tripId = useAppSelector((state) => state.booking.tripId);
  const selectedSeats = useAppSelector((state) => state.booking.selectedSeats);

  const { data: trip } = useGetTripQuery(tripId || '', {
    skip: !tripId,
  });

  const [validatePromotion, { isLoading }] = useValidatePromotionMutation();

  const calculateOrderAmount = () => {
    if (!trip?.pricePerSeat) return 0;
    return trip.pricePerSeat * selectedSeats.length;
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      toast.error('Please enter a promo code');
      return;
    }

    const orderAmount = calculateOrderAmount();
    if (orderAmount === 0) {
      toast.error('Cannot apply promo code');
      return;
    }

    try {
      const result = await validatePromotion({
        code: promoCode.trim().toUpperCase(),
        orderAmount,
      }).unwrap();

      // Response structure from BE: { data: { promotion, userPromotion, discountAmount, finalAmount } }
      if (result.data) {
        const { promotion: promoData, userPromotion, discountAmount, finalAmount } = result.data;

        dispatch(
          setPromotion({
            userPromotionId: userPromotion._id, // Save UserPromotion ID for booking API
            promotionId: promoData._id,
            code: promoData.code,
            title: promoData.title,
            discountType: promoData.discountType,
            discountValue: promoData.discountValue,
            discountAmount,
            finalAmount,
          })
        );

        const discountText =
          promoData.discountType === 'percentage' ? `${promoData.discountValue}%` : `$${promoData.discountValue}`;

        toast.success(`Promo code applied! Save ${discountText}`);
        setPromoCode('');
      }
    } catch (error: any) {
      console.error('Validation error:', error);
      const errorMessage = error?.data?.message || 'Invalid promo code';
      toast.error(errorMessage);
    }
  };

  const handleRemovePromo = () => {
    dispatch(setPromotion(null));
    setPromoCode('');
    toast.info('Promo code removed');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleApplyPromo();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5" />
          Promo Code
        </CardTitle>
      </CardHeader>
      <CardContent>
        {promotion ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-green-600 text-white">
                    {promotion.code}
                  </Badge>
                  <span className="text-sm text-green-700 font-medium">
                    {promotion.discountType === 'percentage'
                      ? `${promotion.discountValue}% off`
                      : `$${promotion.discountValue} off`}
                  </span>
                </div>
                <span className="text-xs text-green-600">{promotion.title}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemovePromo}
                className="h-8 w-8 p-0 text-green-700 hover:text-green-900 hover:bg-green-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500">You can only use one promo code per order.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Enter promo code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="flex-1"
              />
              <Button onClick={handleApplyPromo} disabled={isLoading || !promoCode.trim()} className="min-w-[100px]">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Applying
                  </>
                ) : (
                  'Apply'
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500">Enter your promo code to get a discount</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
