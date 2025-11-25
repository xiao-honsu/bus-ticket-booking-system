'use client';

import { useSearchParams } from 'next/navigation';
import { SearchFilters, TripList } from '@/containers/trip-search-results';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

function SearchContent() {
  const searchParams = useSearchParams();
  const origin = searchParams.get('origin') || '';
  const destination = searchParams.get('destination') || '';
  const date = searchParams.get('date') || '';

  return (
    <>
      <h1 className="text-3xl font-bold mb-2">Search Results</h1>
      <p className="text-muted-foreground mb-6">
        {origin && destination ? `${origin} to ${destination}` : 'All trips'}
        {date && ` on ${new Date(date).toLocaleDateString()}`}
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1">
          <SearchFilters />
        </aside>
        <div className="lg:col-span-3">
          <TripList origin={origin} destination={destination} date={date} />
        </div>
      </div>
    </>
  );
}

export default function SearchPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <Suspense fallback={
        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-6 w-96" />
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <Skeleton className="h-96" />
            <div className="lg:col-span-3 space-y-4">
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
            </div>
          </div>
        </div>
      }>
        <SearchContent />
      </Suspense>
    </main>
  );
}
