'use client';

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { setPromotion } from '@/lib/store/features/booking/bookingSlice';
import { useValidatePromotionMutation } from '@/lib/store/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Tag, X } from 'lucide-react';

interface BookingPromoCodeProps {
  totalAmount: number;
}

export default function BookingPromoCode({ totalAmount }: BookingPromoCodeProps) {
  const dispatch = useAppDispatch();
  const [promoCode, setPromoCode] = useState('');
  const promotion = useAppSelector((state) => state.booking.promotion);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const [validatePromotion, { isLoading }] = useValidatePromotionMutation();

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      toast.error('Please enter a promo code');
      return;
    }

    if (!isAuthenticated) {
      toast.error('Please login to use promo codes');
      return;
    }

    if (totalAmount === 0) {
      toast.error('Please select seats first');
      return;
    }

    try {
      console.log('🚀 Validating promo code:', promoCode, 'for amount:', totalAmount);

      const result = await validatePromotion({
        code: promoCode.trim().toUpperCase(),
        orderAmount: totalAmount,
      }).unwrap();

      console.log('🎉 Validate Promotion Response:', result);

      // Backend response: { promotion, discountAmount, finalAmount }
      // Note: userPromotion is NOT included in response
      if (result?.promotion) {
        const { promotion: promoData, discountAmount, finalAmount } = result;

        dispatch(
          setPromotion({
            userPromotionId: null, // Not provided by backend
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
          promoData.discountType === 'percentage'
            ? `${promoData.discountValue}%`
            : `${promoData.discountValue.toLocaleString()} ₫`;

        toast.success(`🎉 Promo applied! Save ${discountText}`);
        setPromoCode('');
      } else {
        toast.error('Invalid response from server. Please try again.');
      }
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || 'Invalid promo code';

      if (errorMessage.includes('not collected')) {
        toast.error(
          'This promo code is not available. Please check the code or collect it from promotions page first.'
        );
      } else if (errorMessage.includes('expired')) {
        toast.error('This promo code has expired');
      } else if (errorMessage.includes('used')) {
        toast.error('This promo code has already been used');
      } else if (errorMessage.includes('Minimum order')) {
        toast.error(errorMessage);
      } else {
        toast.error('Invalid promo code. Please check and try again.');
      }
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
    <Card className="py-0 gap-0">
      <CardHeader className="p-3 pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Tag className="h-4 w-4 text-primary" />
          Promo Code
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-3">
        {promotion ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2.5 bg-primary text-primary-foreground rounded-lg">
              <div className="flex flex-col gap-0.5 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="font-medium text-xs px-2 py-0.5">
                    {promotion.code}
                  </Badge>
                  <span className="text-xs font-medium">
                    {promotion.discountType === 'percentage'
                      ? `${promotion.discountValue}% off`
                      : `${promotion.discountValue.toLocaleString()} ₫ off`}
                  </span>
                </div>
                <span className="text-[10px] opacity-90 truncate">{promotion.title}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemovePromo}
                className="h-6 w-6 p-0 hover:bg-primary-foreground/20 shrink-0"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground">One promo code per booking</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Enter code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="flex-1 h-8 text-sm"
              />
              <Button
                onClick={handleApplyPromo}
                disabled={isLoading || !promoCode.trim()}
                size="sm"
                className="h-8 px-3"
              >
                {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Apply'}
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground">Have a promo code? Enter it to save!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
