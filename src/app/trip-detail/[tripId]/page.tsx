'use client';

import React from 'react';
import TripDetailView from '@/components/TripDetailView';
import { useGetTripQuery } from '@/lib/store/services/api';
import { notFound } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

interface TripDetailPageProps {
  params: Promise<{
    tripId: string;
  }>;
}

export default function TripDetailPage({ params }: TripDetailPageProps) {
  const { tripId } = React.use(params);

  // Fetch trip from API
  const { data: trip, isLoading, isError } = useGetTripQuery(tripId);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="animate-pulse space-y-6">
            <Skeleton className="h-72 w-full rounded-2xl shadow-xl" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <Skeleton className="h-48 w-full rounded-2xl" />
                <Skeleton className="h-64 w-full rounded-2xl" />
              </div>
              <div className="lg:col-span-1">
                <Skeleton className="h-96 w-full rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (isError || !trip) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated Background Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute top-40 right-10 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '1s' }}
        />
        <div
          className="absolute bottom-20 left-1/3 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '2s' }}
        />
      </div>

      <div className="relative z-10 py-8">
        <TripDetailView trip={trip} />
      </div>
    </main>
  );
}
