'use client';

import React from 'react';
import TripDetailView from '@/components/TripDetailView';
import { useGetTripQuery } from '@/lib/store/services/api';
import { notFound } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Bus, MapPin, Clock, ArrowRight } from 'lucide-react';

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
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-4 md:py-6 max-w-6xl">
          <div className="space-y-4">
            {/* Back Button Skeleton */}
            <Skeleton className="h-8 w-24" />

            {/* Header Section Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Main Trip Info Skeleton */}
              <div className="lg:col-span-2">
                <Card className="py-0 gap-0">
                  <CardHeader className="p-4 pb-3">
                    <div className="space-y-3">
                      {/* Title Skeleton */}
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-6 w-full max-w-md" />
                          <Skeleton className="h-4 w-48" />
                        </div>
                        <Skeleton className="h-6 w-20" />
                      </div>

                      <Separator />

                      {/* Journey Timeline Skeleton */}
                      <div className="bg-muted/50 rounded-lg p-3">
                        <div className="flex items-center justify-between gap-2">
                          {/* Departure */}
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-8 w-20" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-full max-w-[120px]" />
                          </div>

                          {/* Duration */}
                          <div className="flex flex-col items-center gap-1 shrink-0 px-2">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-3 w-12" />
                            <Skeleton className="h-px w-16" />
                            <Skeleton className="h-4 w-12" />
                          </div>

                          {/* Arrival */}
                          <div className="flex-1 space-y-2 flex flex-col items-end">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-8 w-20" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-full max-w-[120px]" />
                          </div>
                        </div>
                      </div>

                      {/* Stops Skeleton */}
                      <div className="pt-2 border-t space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <div className="flex flex-wrap gap-1.5">
                          <Skeleton className="h-5 w-24" />
                          <Skeleton className="h-5 w-28" />
                          <Skeleton className="h-5 w-20" />
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  {/* Bus & Driver Info Skeleton */}
                  <CardContent className="p-4 pt-0 space-y-4">
                    {/* Bus Info */}
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="bg-muted/50 rounded-lg p-2 space-y-1">
                            <Skeleton className="h-3 w-12" />
                            <Skeleton className="h-4 w-16" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Amenities Skeleton */}
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <div className="flex flex-wrap gap-2">
                        {[1, 2, 3, 4].map((i) => (
                          <Skeleton key={i} className="h-7 w-24" />
                        ))}
                      </div>
                    </div>

                    {/* Driver Info Skeleton */}
                    <div className="pt-3 border-t space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex justify-between">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar Skeleton */}
              <div className="lg:col-span-1 space-y-3">
                {/* Price Card Skeleton */}
                <Card className="py-0 gap-0">
                  <CardHeader className="p-3 pb-2">
                    <Skeleton className="h-4 w-32" />
                  </CardHeader>
                  <CardContent className="px-3 pb-3 space-y-3">
                    <div className="bg-primary/10 rounded-lg p-3 space-y-1">
                      <Skeleton className="h-3 w-20 mx-auto" />
                      <Skeleton className="h-8 w-32 mx-auto" />
                    </div>

                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex justify-between">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                      ))}
                    </div>

                    <Skeleton className="h-2 w-full" />
                    <Skeleton className="h-9 w-full" />
                  </CardContent>
                </Card>

                {/* Operator Card Skeleton */}
                <Card className="py-0 gap-0">
                  <CardHeader className="p-3 pb-2">
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent className="px-3 pb-3 space-y-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-9 w-9 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                    <Skeleton className="h-8 w-full" />
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Rating Details Skeleton */}
            <Card className="py-0 gap-0">
              <CardHeader className="p-3 pb-2">
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                  <Skeleton className="h-12 w-24" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-2 w-full" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Policies Skeleton */}
            <Card className="py-0 gap-0">
              <CardHeader className="p-3 pb-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </CardHeader>
              <CardContent className="px-3 pb-3 space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </CardContent>
            </Card>

            {/* Footer CTA Skeleton */}
            <div className="flex flex-col sm:flex-row gap-2 justify-center py-4">
              <Skeleton className="h-9 w-full sm:w-40" />
              <Skeleton className="h-9 w-full sm:w-32" />
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
    <main className="min-h-screen bg-background">
      <TripDetailView trip={trip} />
    </main>
  );
}
