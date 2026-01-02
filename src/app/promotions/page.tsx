'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetActivePromotionsQuery, useCollectPromotionMutation } from '@/lib/store/services/api';
import {
  Loader2,
  Tag,
  Calendar,
  TrendingUp,
  DollarSign,
  Gift,
  Clock,
  Sparkles,
  Ticket,
  Copy,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function PromotionsPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
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
    } catch (error: unknown) {
      const err = error as { status?: number; data?: { message?: string } };
      if (err?.status === 401) {
        toast.error('Please login to collect promotions', {
          action: {
            label: 'Login',
            onClick: () => router.push('/login'),
          },
        });
      } else {
        toast.error(err?.data?.message || 'Failed to collect promotion');
      }
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('Code copied to clipboard!');
    setTimeout(() => setCopiedCode(null), 2000);
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

  const getDiscountDisplay = (promotion: { discountType: string; discountValue: number }) => {
    if (promotion.discountType === 'fixed') {
      return `${promotion.discountValue.toLocaleString()}₫`;
    }
    return `${promotion.discountValue}%`;
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-background via-purple-50/30 to-background dark:from-background dark:via-purple-950/20 dark:to-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-linear-to-r from-purple-600 via-pink-600 to-purple-600" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTZzLTItNC0yLTYgMi00IDItNi0yLTQtMi02aDJ2MjRoLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-400/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-400/30 rounded-full blur-3xl" />

        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center p-3 bg-white/20 backdrop-blur-sm rounded-2xl mb-6">
              <Gift className="h-10 w-10 md:h-14 md:w-14 text-white" />
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">Exclusive Promotions</h1>
            <p className="text-lg md:text-xl text-white/90 mb-8">
              Collect amazing discounts and save big on your next journey!
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-sm">
                <Sparkles className="h-4 w-4 mr-2" />
                Limited Time Offers
              </Badge>
              <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-sm">
                <Ticket className="h-4 w-4 mr-2" />
                {promotionsData?.totalResults || 0} Active Deals
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Promotions Grid */}
      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : promotionsData?.results?.length === 0 ? (
          <Card className="max-w-md mx-auto text-center p-12">
            <div className="inline-flex items-center justify-center p-4 bg-muted rounded-full mb-4">
              <Tag className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">No Active Promotions</h3>
            <p className="text-muted-foreground mb-6">Check back later for exciting deals and discounts!</p>
            <Button onClick={() => router.push('/search')} variant="outline">
              Browse Trips
            </Button>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {promotionsData?.results?.map(
                (promotion: {
                  _id: string;
                  code: string;
                  title: string;
                  description?: string;
                  discountType: string;
                  discountValue: number;
                  minOrderValue?: number;
                  maxDiscount?: number;
                  endDate: string;
                  usageLimit: number;
                  usedCount: number;
                  imageUrl?: string;
                  terms?: string;
                }) => {
                  const daysRemaining = getDaysRemaining(promotion.endDate);
                  const remainingUsage = promotion.usageLimit - promotion.usedCount;
                  const usagePercentage = (promotion.usedCount / promotion.usageLimit) * 100;
                  const isUrgent = daysRemaining <= 3;
                  const isAlmostGone = usagePercentage >= 80;

                  return (
                    <Card
                      key={promotion._id}
                      className={cn(
                        'overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2',
                        isUrgent ? 'border-red-200 dark:border-red-900' : 'border-transparent hover:border-primary/20'
                      )}
                    >
                      {/* Promotion Header/Image */}
                      <div className="relative h-48 bg-linear-to-br from-purple-500 via-pink-500 to-purple-600 overflow-hidden">
                        {promotion.imageUrl ? (
                          <img
                            src={promotion.imageUrl}
                            alt={promotion.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
                            <div className="text-5xl font-black mb-2 drop-shadow-lg">
                              {getDiscountDisplay(promotion)}
                            </div>
                            <div className="text-lg font-medium opacity-90">OFF</div>
                          </div>
                        )}

                        {/* Urgency Badge */}
                        {isUrgent && (
                          <Badge className="absolute top-4 right-4 bg-red-500 text-white animate-pulse">
                            <Clock className="h-3 w-3 mr-1" />
                            {daysRemaining <= 0 ? 'Last day!' : `${daysRemaining}d left`}
                          </Badge>
                        )}

                        {/* Discount Type Badge */}
                        <Badge className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm text-white">
                          {promotion.discountType === 'fixed' ? 'Fixed Amount' : 'Percentage'}
                        </Badge>
                      </div>

                      <CardContent className="p-6 space-y-4">
                        {/* Code with Copy Button */}
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className="font-mono font-bold text-sm px-3 py-1.5 bg-primary/10 text-primary flex-1 justify-center"
                          >
                            {promotion.code}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCopyCode(promotion.code)}
                            className="h-8 w-8 p-0"
                          >
                            {copiedCode === promotion.code ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h3 className="text-lg font-bold text-foreground mb-1 line-clamp-1">{promotion.title}</h3>
                          {promotion.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">{promotion.description}</p>
                          )}
                        </div>

                        {/* Discount Details */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          {promotion.minOrderValue && promotion.minOrderValue > 0 && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <TrendingUp className="h-4 w-4 text-blue-500" />
                              <span>Min: {promotion.minOrderValue.toLocaleString()}₫</span>
                            </div>
                          )}
                          {promotion.maxDiscount && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <DollarSign className="h-4 w-4 text-green-500" />
                              <span>Max: {promotion.maxDiscount.toLocaleString()}₫</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                            <Calendar className="h-4 w-4 text-orange-500" />
                            <span>Valid until {formatDate(promotion.endDate)}</span>
                          </div>
                        </div>

                        {/* Usage Progress */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Remaining</span>
                            <span className={cn('font-medium', isAlmostGone ? 'text-red-500' : 'text-foreground')}>
                              {remainingUsage} / {promotion.usageLimit}
                            </span>
                          </div>
                          <Progress
                            value={usagePercentage}
                            className={cn(
                              'h-2',
                              isAlmostGone
                                ? '[&>div]:bg-red-500'
                                : usagePercentage >= 50
                                  ? '[&>div]:bg-yellow-500'
                                  : '[&>div]:bg-green-500'
                            )}
                          />
                          {isAlmostGone && <p className="text-xs text-red-500 font-medium">⚡ Almost gone!</p>}
                        </div>

                        {/* Action Button */}
                        <Button
                          className={cn(
                            'w-full font-semibold transition-all',
                            remainingUsage === 0
                              ? 'bg-muted text-muted-foreground cursor-not-allowed'
                              : 'bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl'
                          )}
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
                          <details className="group/details">
                            <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors list-none flex items-center gap-1">
                              <span>Terms & Conditions</span>
                              <span className="text-[10px] group-open/details:rotate-180 transition-transform">▼</span>
                            </summary>
                            <p className="text-xs text-muted-foreground mt-2 p-2 bg-muted/50 rounded">
                              {promotion.terms}
                            </p>
                          </details>
                        )}
                      </CardContent>
                    </Card>
                  );
                }
              )}
            </div>

            {/* Pagination */}
            {promotionsData && promotionsData.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="border-2"
                >
                  ← Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: promotionsData.totalPages }, (_, i) => i + 1).map((page) => {
                    if (
                      page === 1 ||
                      page === promotionsData.totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className={cn('min-w-10', currentPage === page && 'bg-primary text-primary-foreground')}
                        >
                          {page}
                        </Button>
                      );
                    }
                    if (page === currentPage - 2 || page === currentPage + 2) {
                      return (
                        <span key={page} className="px-2 text-muted-foreground">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.min(promotionsData.totalPages, p + 1))}
                  disabled={currentPage === promotionsData.totalPages}
                  className="border-2"
                >
                  Next →
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
