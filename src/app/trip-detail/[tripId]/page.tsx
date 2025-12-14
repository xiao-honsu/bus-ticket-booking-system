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
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Skeleton className="h-64 w-full mb-6" />
          <Skeleton className="h-32 w-full mb-4" />
          <Skeleton className="h-48 w-full" />
        </div>
      </main>
    );
  }

  if (isError || !trip) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <TripDetailView trip={trip} />
    </main>
  );
}
