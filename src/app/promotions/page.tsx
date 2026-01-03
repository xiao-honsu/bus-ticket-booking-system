'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Gift,
  Tag,
  Clock,
  TrendingUp,
  Ticket,
  Sparkles,
  Copy,
  Check,
  Calendar,
  DollarSign,
  Loader2,
  Star,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useGetActivePromotionsQuery, useCollectPromotionMutation } from '@/lib/store/services/api';
import { toast } from 'sonner';
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
    <main className="min-h-screen bg-background">
      {/* Hero Section - Clean, consistent with index page */}
      <section className="relative bg-background text-foreground py-12 md:py-16 overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-linear-to-br from-purple-50 via-pink-50 to-background dark:from-purple-950/20 dark:via-pink-950/20 dark:to-background" />

        {/* Decorative shapes */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-purple-200/30 dark:bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-pink-200/30 dark:bg-pink-500/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Icon Badge */}
            <div className="inline-flex items-center justify-center p-3 bg-secondary/80 backdrop-blur-sm rounded-2xl mb-4 border border-border">
              <Gift className="h-10 w-10 md:h-12 md:w-12 text-primary" />
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              Exclusive{' '}
              <span className="bg-linear-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Promotions
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base md:text-lg lg:text-xl mb-6 text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Collect amazing discounts and save big on your next journey!
            </p>

            {/* Stats Badges */}
            <div className="flex flex-wrap gap-3 justify-center items-center">
              <Badge variant="secondary" className="px-4 py-2 text-sm border border-border">
                <Sparkles className="w-4 h-4 mr-2 text-yellow-500" />
                Limited Time Offers
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm border border-border">
                <Ticket className="w-4 h-4 mr-2 text-primary" />
                {promotionsData?.totalResults || 0} Active Deals
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Promotions Grid Section */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          {isLoading ? (
            /* Loading Skeleton */
            <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4 md:gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="gap-0 py-0 overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-6 space-y-4">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Separator />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-2 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : promotionsData?.results?.length === 0 ? (
            /* Empty State */
            <Card className="max-w-md mx-auto text-center gap-0 py-0">
              <CardContent className="p-12">
                <div className="inline-flex items-center justify-center p-4 bg-muted rounded-full mb-4">
                  <Tag className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-card-foreground">No Active Promotions</h3>
                <p className="text-muted-foreground mb-6">Check back later for exciting deals and discounts!</p>
                <Button onClick={() => router.push('/search')} variant="outline">
                  Browse Trips
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Promotions Grid - Consistent with PopularRoutes pattern */}
              <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4 md:gap-6">
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
                          'gap-0 py-0 overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border',
                          isUrgent ? 'border-red-200 dark:border-red-900' : 'border-border'
                        )}
                      >
                        {/* Promotion Image/Header */}
                        <div className="relative h-40 bg-linear-to-br from-primary via-purple-500 to-pink-500 overflow-hidden">
                          {promotion.imageUrl ? (
                            <img
                              src={promotion.imageUrl}
                              alt={promotion.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
                              <div className="text-4xl md:text-5xl font-black mb-1 drop-shadow-lg">
                                {getDiscountDisplay(promotion)}
                              </div>
                              <div className="text-sm md:text-base font-semibold opacity-90">OFF</div>
                            </div>
                          )}

                          {/* Urgency Badge */}
                          {isUrgent && (
                            <Badge className="absolute top-3 right-3 bg-red-500 text-white animate-pulse shadow-lg">
                              <Clock className="h-3 w-3 mr-1" />
                              {daysRemaining <= 0 ? 'Last day!' : `${daysRemaining}d left`}
                            </Badge>
                          )}

                          {/* Discount Type Badge */}
                          <Badge className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm text-white border-white/20">
                            {promotion.discountType === 'fixed' ? 'Fixed' : 'Percentage'}
                          </Badge>
                        </div>

                        <CardContent className="p-5 space-y-4">
                          {/* Code Section */}
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-muted border-2 border-dashed border-border rounded-lg p-2 text-center">
                              <p className="text-xs text-muted-foreground mb-0.5">Code</p>
                              <p className="text-base font-bold text-primary font-mono tracking-wide">
                                {promotion.code}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCopyCode(promotion.code)}
                              className="h-auto px-3 py-2"
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
                            <h3 className="text-base md:text-lg font-bold text-card-foreground mb-1 line-clamp-1">
                              {promotion.title}
                            </h3>
                            {promotion.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">{promotion.description}</p>
                            )}
                          </div>

                          <Separator />

                          {/* Details Grid */}
                          <div className="space-y-2 text-sm">
                            {promotion.minOrderValue && promotion.minOrderValue > 0 && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <TrendingUp className="h-4 w-4 text-blue-500 shrink-0" />
                                <span className="text-xs">Min. order: {promotion.minOrderValue.toLocaleString()}₫</span>
                              </div>
                            )}
                            {promotion.maxDiscount && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <DollarSign className="h-4 w-4 text-green-500 shrink-0" />
                                <span className="text-xs">Max discount: {promotion.maxDiscount.toLocaleString()}₫</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="h-4 w-4 text-orange-500 shrink-0" />
                              <span className="text-xs">Valid until {formatDate(promotion.endDate)}</span>
                            </div>
                          </div>

                          {/* Usage Progress */}
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Remaining</span>
                              <span className={cn('font-semibold', isAlmostGone ? 'text-red-500' : 'text-foreground')}>
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
                            {isAlmostGone && (
                              <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                                <Sparkles className="h-3 w-3" />
                                Almost gone!
                              </p>
                            )}
                          </div>

                          {/* Action Button */}
                          <Button
                            className={cn(
                              'w-full font-semibold transition-all',
                              remainingUsage === 0 && 'opacity-50 cursor-not-allowed'
                            )}
                            onClick={() => handleCollect(promotion._id, promotion.code)}
                            disabled={isCollecting || remainingUsage === 0}
                            size="sm"
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

                          {/* Terms & Conditions */}
                          {promotion.terms && (
                            <details className="group/details">
                              <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors list-none flex items-center gap-1">
                                <span>Terms & Conditions</span>
                                <span className="text-[10px] group-open/details:rotate-180 transition-transform">
                                  ▼
                                </span>
                              </summary>
                              <p className="text-xs text-muted-foreground mt-2 p-2 bg-muted/50 rounded border border-border">
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

              {/* Pagination - Consistent with index pattern */}
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
      </section>
    </main>
  );
}
