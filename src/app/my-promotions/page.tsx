'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGetMyPromotionsQuery } from '@/lib/store/services/api';
import { Loader2, Wallet, Calendar, DollarSign, CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MyPromotionsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'available' | 'used' | 'expired'>('available');
  const [currentPage, setCurrentPage] = useState(1);

  const { data: promotionsData, isLoading } = useGetMyPromotionsQuery({
    page: currentPage,
    limit: 12,
    status: activeTab,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
      return `${promotion.discountValue.toLocaleString()}₫`;
    }
    return `${promotion.discountValue}%`;
  };

  const handleUseNow = () => {
    router.push('/search');
  };

  const handleViewBooking = (bookingId: string) => {
    router.push(`/bookings/${bookingId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-linear-to-r from-purple-600 to-pink-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4">
            <Wallet className="h-12 w-12" />
            <div>
              <h1 className="text-4xl font-bold">My Promotions</h1>
              <p className="text-lg opacity-90 mt-2">Manage your collected discount codes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="available" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Available
            </TabsTrigger>
            <TabsTrigger value="used" className="flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Used
            </TabsTrigger>
            <TabsTrigger value="expired" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Expired
            </TabsTrigger>
          </TabsList>

          {/* Available Promotions */}
          <TabsContent value="available">
            <PromotionsList
              promotions={promotionsData?.results || []}
              isLoading={isLoading}
              emptyMessage="No available promotions"
              emptyDescription="Collect promotions to use them on your bookings!"
              renderActions={(userPromotion: any) => {
                const promotion = userPromotion.promotion || userPromotion;
                const daysRemaining = getDaysRemaining(promotion.endDate);
                return (
                  <>
                    {daysRemaining <= 3 && (
                      <Badge variant="destructive" className="mb-2">
                        <Clock className="h-3 w-3 mr-1" />
                        Expires in {daysRemaining} days
                      </Badge>
                    )}
                    <Button
                      className="w-full bg-linear-to-r from-purple-600 to-pink-600"
                      onClick={handleUseNow}
                      size="sm"
                    >
                      Use Now
                    </Button>
                  </>
                );
              }}
              getDiscountDisplay={getDiscountDisplay}
              formatDate={formatDate}
            />
          </TabsContent>

          {/* Used Promotions */}
          <TabsContent value="used">
            <PromotionsList
              promotions={promotionsData?.results || []}
              isLoading={isLoading}
              emptyMessage="No used promotions"
              emptyDescription="Promotions you've used will appear here"
              renderActions={(userPromotion: any) => (
                <>
                  <div className="text-sm text-gray-600 mb-2">
                    <p>
                      <strong>Used on:</strong> {formatDate(userPromotion.usedAt)}
                    </p>
                  </div>
                  {userPromotion.usedInBooking && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewBooking(userPromotion.usedInBooking)}
                      className="w-full"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Booking
                    </Button>
                  )}
                </>
              )}
              getDiscountDisplay={getDiscountDisplay}
              formatDate={formatDate}
            />
          </TabsContent>

          {/* Expired Promotions */}
          <TabsContent value="expired">
            <PromotionsList
              promotions={promotionsData?.results || []}
              isLoading={isLoading}
              emptyMessage="No expired promotions"
              emptyDescription="Expired promotions will appear here"
              renderActions={(userPromotion: any) => (
                <Badge variant="secondary" className="w-full justify-center">
                  Expired on {formatDate(userPromotion.promotion.endDate)}
                </Badge>
              )}
              getDiscountDisplay={getDiscountDisplay}
              formatDate={formatDate}
            />
          </TabsContent>
        </Tabs>

        {/* Pagination */}
        {promotionsData && promotionsData.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
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
      </div>
    </div>
  );
}

// Reusable Promotions List Component
function PromotionsList({
  promotions,
  isLoading,
  emptyMessage,
  emptyDescription,
  renderActions,
  getDiscountDisplay,
  formatDate,
}: {
  promotions: any[];
  isLoading: boolean;
  emptyMessage: string;
  emptyDescription: string;
  renderActions: (userPromotion: any) => React.ReactNode;
  getDiscountDisplay: (promotion: any) => string;
  formatDate: (date: string) => string;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (promotions.length === 0) {
    return (
      <div className="text-center py-12">
        <Wallet className="h-16 w-16 mx-auto mb-4 text-gray-400" />
        <p className="text-xl text-gray-600 font-semibold">{emptyMessage}</p>
        <p className="text-gray-500 mt-2">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {promotions.map((userPromotion: any) => {
        const promotion = userPromotion.promotion || userPromotion;
        return (
          <Card key={userPromotion._id} className="overflow-hidden hover:shadow-lg transition-shadow">
            {/* Header with Code */}
            <div className="bg-linear-to-r from-purple-500 to-pink-500 p-4 text-white">
              <div className="text-center">
                <p className="text-sm opacity-80">DISCOUNT CODE</p>
                <p className="text-2xl font-bold font-mono mt-1">{promotion.code}</p>
              </div>
            </div>

            <CardContent className="p-6">
              {/* Title & Description */}
              <h3 className="text-lg font-bold text-gray-900 mb-2">{promotion.title}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{promotion.description}</p>

              {/* Discount Details */}
              <div className="space-y-2 mb-4 pb-4 border-b">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Discount</span>
                  <span className="text-lg font-bold text-green-600">{getDiscountDisplay(promotion)}</span>
                </div>

                {promotion.minOrderValue > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Min order</span>
                    <span className="font-semibold">{promotion.minOrderValue.toLocaleString()}₫</span>
                  </div>
                )}

                {promotion.maxDiscount && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Max discount</span>
                    <span className="font-semibold">{promotion.maxDiscount.toLocaleString()}₫</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Valid until</span>
                  <span className="font-semibold">{formatDate(promotion.endDate).split(',')[0]}</span>
                </div>
              </div>

              {/* Collection Info */}
              <div className="mb-4 text-xs text-gray-500">
                <p>
                  <Calendar className="inline h-3 w-3 mr-1" />
                  Collected on {formatDate(userPromotion.collectedAt)}
                </p>
              </div>

              {/* Actions */}
              {renderActions(userPromotion)}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
