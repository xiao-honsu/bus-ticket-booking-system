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
import { Loader2, Tag, X, Sparkles } from 'lucide-react';

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

      console.log('🎉 Validate Promotion Response (RAW):', result);
      console.log('🔍 Response structure check:', {
        hasData: !!result.data,
        hasPromotion: !!result.promotion,
        keys: Object.keys(result),
      });

      // Handle different response structures
      const responseData = result.data || result;

      if (responseData && responseData.promotion && responseData.userPromotion) {
        const { promotion: promoData, userPromotion, discountAmount, finalAmount } = responseData;

        console.log('💰 Promotion Data:', {
          userPromotionId: userPromotion._id,
          promotionId: promoData._id,
          code: promoData.code,
          title: promoData.title,
          discountType: promoData.discountType,
          discountValue: promoData.discountValue,
          discountAmount,
          finalAmount,
        });

        dispatch(
          setPromotion({
            userPromotionId: userPromotion._id,
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
        console.error('❌ Invalid response structure:', result);
        console.error('❌ Expected fields missing:', {
          hasPromotion: !!responseData?.promotion,
          hasUserPromotion: !!responseData?.userPromotion,
          hasDiscountAmount: !!responseData?.discountAmount,
          hasFinalAmount: !!responseData?.finalAmount,
        });
        toast.error('Invalid response from server. Please try again.');
      }
    } catch (error: any) {
      console.error('❌ Validation error:', error);
      console.error('❌ Error details:', {
        status: error?.status,
        data: error?.data,
        message: error?.data?.message,
      });

      // Handle specific error: User hasn't collected promotion
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
    <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-5 w-5 text-amber-600" />
          <span className="text-amber-900">Promo Code</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {promotion ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-500 to-emerald-500 border border-green-600 rounded-xl shadow-md">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-white text-green-700 font-bold px-3 py-1">
                    {promotion.code}
                  </Badge>
                  <span className="text-sm text-white font-bold">
                    {promotion.discountType === 'percentage'
                      ? `${promotion.discountValue}% off`
                      : `${promotion.discountValue.toLocaleString()} ₫ off`}
                  </span>
                </div>
                <span className="text-xs text-white/90 font-medium">{promotion.title}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemovePromo}
                className="h-8 w-8 p-0 text-white hover:text-green-900 hover:bg-white/30"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-amber-700 bg-amber-100 px-3 py-2 rounded-lg">
              ✨ You can only use one promo code per booking
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Enter code (e.g., STUDENT20)"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="flex-1 border-amber-300 focus:border-amber-500 bg-white"
              />
              <Button
                onClick={handleApplyPromo}
                disabled={isLoading || !promoCode.trim()}
                className="min-w-[90px] bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
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
            <p className="text-xs text-amber-700 flex items-center gap-1">
              <Tag className="h-3 w-3" />
              Have a promo code? Enter it to save money!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
