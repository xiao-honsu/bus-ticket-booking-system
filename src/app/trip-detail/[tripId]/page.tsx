'use client';

import React from 'react';
import TripDetailView from '@/components/TripDetailView';
import { useGetTripQuery } from '@/lib/store/services/api';
import { notFound } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import LiquidEther from '@/components/ui/liquid-ether';

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
      <main className="relative min-h-screen">
        <LiquidEther className="fixed inset-0 -z-10" />
        <div className="container mx-auto px-3 py-4 md:px-4 md:py-6 max-w-6xl">
          <div className="animate-pulse space-y-4">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-48 w-full rounded-lg" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-3">
                <Skeleton className="h-32 w-full rounded-lg" />
                <Skeleton className="h-40 w-full rounded-lg" />
              </div>
              <div className="lg:col-span-1 space-y-3">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-32 w-full rounded-lg" />
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
    <main className="relative min-h-screen">
      <LiquidEther className="fixed inset-0 -z-10" />
      <div className="relative z-10">
        <TripDetailView trip={trip} />
      </div>
    </main>
  );
}
