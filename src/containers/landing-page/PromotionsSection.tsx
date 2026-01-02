'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Ticket, Clock, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

interface Promotion {
  _id: string;
  code: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxDiscount?: number;
  minOrderValue: number;
  endDate: string;
  remainingUsage: number;
  usageLimit: number;
  imageUrl?: string;
}

export default function PromotionsSection() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_URL}/promotions/active?page=1&limit=4`);

        // If endpoint doesn't exist (404), silently hide the section
        if (response.status === 404) {
          setError(true);
          setIsLoading(false);
          return;
        }

        if (!response.ok) throw new Error('Failed to fetch promotions');

        const data = await response.json();
        setPromotions(data.results || []);
        setError(false);
      } catch (err) {
        // Only log error if it's not a network/fetch error (backend might not be ready)
        if (err instanceof Error && !err.message.includes('fetch')) {
          console.error('Error fetching promotions:', err);
        }
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPromotions();
  }, []);

  const formatDiscount = (promo: Promotion) => {
    if (promo.discountType === 'percentage') {
      return `${promo.discountValue}% OFF`;
    }
    return `${(promo.discountValue / 1000).toFixed(0)}K đ OFF`;
  };

  const formatEndDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <section className="py-12 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <Skeleton className="h-10 w-64 mx-auto mb-3" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <Skeleton className="h-72 w-full rounded-xl" />
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || promotions.length === 0) {
    return null; // Không hiển thị section nếu có lỗi hoặc không có promotions
  }

  return (
    <section className="py-12 bg-muted/30 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-orange-500 animate-pulse" />
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Hot <span className="text-primary">Promotions</span>
            </h2>
            <Sparkles className="w-6 h-6 text-orange-500 animate-pulse" />
          </div>
          <p className="text-muted-foreground text-base">Save more on your next trip with exclusive deals!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {promotions.map((promo, index) => (
            <Card
              key={promo._id}
              className="group relative overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-primary/50"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Promotional Badge */}
              <div className="absolute top-3 right-3 z-10">
                <Badge className="bg-linear-to-r from-orange-500 to-pink-500 text-white font-bold px-3 py-1 shadow-lg">
                  {formatDiscount(promo)}
                </Badge>
              </div>

              {/* Image or gradient background */}
              <CardHeader className="relative h-32 bg-linear-to-br from-primary via-purple-500 to-pink-500 p-0 flex items-center justify-center">
                {promo.imageUrl ? (
                  <img src={promo.imageUrl} alt={promo.title} className="w-full h-full object-cover" />
                ) : (
                  <Ticket className="w-16 h-16 text-white opacity-80" />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent" />
              </CardHeader>

              {/* Content */}
              <CardContent className="p-5">
                <div className="mb-3">
                  <h3 className="text-lg font-bold text-card-foreground mb-1 line-clamp-1">{promo.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 min-h-10">{promo.description}</p>
                </div>

                {/* Promo Code */}
                <div className="mb-3 bg-muted border-2 border-dashed border-border rounded-lg p-2 text-center group-hover:border-primary transition-colors">
                  <p className="text-xs text-muted-foreground mb-1">Promo Code</p>
                  <p className="text-lg font-bold text-primary tracking-wider">{promo.code}</p>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span>Min. order: {(promo.minOrderValue / 1000).toFixed(0)}K đ</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <span>Valid until: {formatEndDate(promo.endDate)}</span>
                  </div>
                </div>

                {/* Remaining slots */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Remaining</span>
                    <span className="font-semibold">
                      {promo.remainingUsage}/{promo.usageLimit}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-linear-to-r from-primary to-pink-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${(promo.remainingUsage / promo.usageLimit) * 100}%` }}
                    />
                  </div>
                </div>

                {/* CTA Button */}
                <Button className="w-full font-semibold shadow-md">Use Now</Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link href="/promotions">
            <Button variant="outline" size="lg" className="font-semibold px-8 group">
              View All Promotions
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
