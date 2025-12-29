'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGetActivePromotionsQuery, useCollectPromotionMutation } from '@/lib/store/services/api';
import { Loader2, Tag, Calendar, TrendingUp, DollarSign, Gift, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function PromotionsPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const { data: promotionsData, isLoading } = useGetActivePromotionsQuery({
    page: currentPage,
    limit: 12,
  });

  const [collectPromotion, { isLoading: isCollecting }] = useCollectPromotionMutation();

  const handleCollect = async (promotionId: string, code: string) => {
    try {
      await collectPromotion(promotionId).unwrap();
      toast.success(`Collected ${code} successfully!`, {
        description: 'Check your promotions in My Promotions page',
      });
    } catch (error: any) {
      if (error?.status === 401) {
        toast.error('Please login to collect promotions', {
          action: {
            label: 'Login',
            onClick: () => router.push('/login'),
          },
        });
      } else {
        toast.error(error?.data?.message || 'Failed to collect promotion');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getDiscountDisplay = (promotion: any) => {
    if (promotion.discountType === 'fixed') {
      return `${promotion.discountValue.toLocaleString()}₫ OFF`;
    }
    return `${promotion.discountValue}% OFF`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <Gift className="h-16 w-16 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">Available Promotions</h1>
            <p className="text-lg opacity-90">Collect amazing discounts for your next trip!</p>
          </div>
        </div>
      </div>

      {/* Promotions Grid */}
      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : promotionsData?.results?.length === 0 ? (
          <div className="text-center py-12">
            <Tag className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p className="text-xl text-gray-600">No active promotions at the moment</p>
            <p className="text-gray-500 mt-2">Check back later for exciting deals!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {promotionsData?.results?.map((promotion: any) => {
                const daysRemaining = getDaysRemaining(promotion.endDate);
                const remainingUsage = promotion.usageLimit - promotion.usedCount;
                const usagePercentage = (promotion.usedCount / promotion.usageLimit) * 100;

                return (
                  <Card
                    key={promotion._id}
                    className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    {/* Promotion Image */}
                    {promotion.imageUrl ? (
                      <div className="h-48 bg-gradient-to-r from-purple-400 to-pink-400 relative">
                        <img src={promotion.imageUrl} alt={promotion.title} className="w-full h-full object-cover" />
                        {daysRemaining <= 3 && (
                          <Badge className="absolute top-4 right-4 bg-red-500">
                            <Clock className="h-3 w-3 mr-1" />
                            {daysRemaining}d left
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <div className="h-48 bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center relative">
                        <div className="text-center text-white">
                          <Tag className="h-16 w-16 mx-auto mb-2" />
                          <p className="text-3xl font-bold">{getDiscountDisplay(promotion)}</p>
                        </div>
                        {daysRemaining <= 3 && (
                          <Badge className="absolute top-4 right-4 bg-red-500">
                            <Clock className="h-3 w-3 mr-1" />
                            {daysRemaining}d left
                          </Badge>
                        )}
                      </div>
                    )}

                    <CardContent className="p-6">
                      {/* Code Badge */}
                      <div className="mb-4">
                        <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 text-sm font-mono font-bold">
                          {promotion.code}
                        </Badge>
                      </div>

                      {/* Title & Description */}
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{promotion.title}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{promotion.description}</p>

                      {/* Discount Info */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="font-semibold text-green-600">{getDiscountDisplay(promotion)}</span>
                        </div>

                        {promotion.minOrderValue > 0 && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <TrendingUp className="h-4 w-4" />
                            <span>Min order: {promotion.minOrderValue.toLocaleString()}₫</span>
                          </div>
                        )}

                        {promotion.maxDiscount && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <DollarSign className="h-4 w-4" />
                            <span>Max discount: {promotion.maxDiscount.toLocaleString()}₫</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>Valid until {formatDate(promotion.endDate)}</span>
                        </div>
                      </div>

                      {/* Usage Progress */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Remaining</span>
                          <span>
                            {remainingUsage} / {promotion.usageLimit}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              usagePercentage >= 80
                                ? 'bg-red-500'
                                : usagePercentage >= 50
                                  ? 'bg-yellow-500'
                                  : 'bg-green-500'
                            }`}
                            style={{ width: `${usagePercentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Collect Button */}
                      <Button
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        onClick={() => handleCollect(promotion._id, promotion.code)}
                        disabled={isCollecting || remainingUsage === 0}
                      >
                        {isCollecting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : remainingUsage === 0 ? (
                          'Sold Out'
                        ) : (
                          <>
                            <Gift className="h-4 w-4 mr-2" />
                            Collect Now
                          </>
                        )}
                      </Button>

                      {/* Terms */}
                      {promotion.terms && (
                        <details className="mt-4">
                          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                            Terms & Conditions
                          </summary>
                          <p className="text-xs text-gray-600 mt-2">{promotion.terms}</p>
                        </details>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Pagination */}
            {promotionsData && promotionsData.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-12">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4 text-sm">
                  Page {currentPage} of {promotionsData.totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.min(promotionsData.totalPages, p + 1))}
                  disabled={currentPage === promotionsData.totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
