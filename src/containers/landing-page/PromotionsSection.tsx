'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Ticket, Clock, TrendingUp, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
      <section className="py-16 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-64 mx-auto mb-3" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-72 w-full rounded-xl" />
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
    <section className="py-16 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="w-8 h-8 text-red-600 animate-pulse" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Hot <span className="text-red-600">Promotions</span>
            </h2>
            <Sparkles className="w-8 h-8 text-red-600 animate-pulse" />
          </div>
          <p className="text-gray-600 text-lg">Save more on your next trip with exclusive deals!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {promotions.map((promo, index) => (
            <div
              key={promo._id}
              className="group relative bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-red-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Promotional Badge */}
              <div className="absolute top-3 right-3 z-10">
                <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold px-3 py-1 shadow-lg">
                  {formatDiscount(promo)}
                </Badge>
              </div>

              {/* Image or gradient background */}
              <div className="relative h-32 bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 flex items-center justify-center">
                {promo.imageUrl ? (
                  <img src={promo.imageUrl} alt={promo.title} className="w-full h-full object-cover" />
                ) : (
                  <Ticket className="w-16 h-16 text-white opacity-80" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="mb-3">
                  <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">{promo.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2 min-h-[2.5rem]">{promo.description}</p>
                </div>

                {/* Promo Code */}
                <div className="mb-3 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-2 text-center group-hover:border-red-400 transition-colors">
                  <p className="text-xs text-gray-500 mb-1">Promo Code</p>
                  <p className="text-lg font-bold text-red-600 tracking-wider">{promo.code}</p>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span>Min. order: {(promo.minOrderValue / 1000).toFixed(0)}K đ</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <span>Valid until: {formatEndDate(promo.endDate)}</span>
                  </div>
                </div>

                {/* Remaining slots */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Remaining</span>
                    <span className="font-semibold">
                      {promo.remainingUsage}/{promo.usageLimit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-red-500 to-orange-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${(promo.remainingUsage / promo.usageLimit) * 100}%` }}
                    />
                  </div>
                </div>

                {/* CTA Button */}
                <Button className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold shadow-md">
                  Use Now
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link href="/promotions">
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-semibold px-8"
            >
              View All Promotions →
            </Button>
          </Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  );
}
