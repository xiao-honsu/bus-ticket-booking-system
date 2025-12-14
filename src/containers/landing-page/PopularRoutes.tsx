'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useSearchTripsQuery } from '@/lib/store/services/api';
import { MapPin, DollarSign } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function PopularRoutes() {
  // Fetch trips from API with a reasonable limit
  const { data, isLoading, isError } = useSearchTripsQuery({
    limit: 10,
  });

  // Compute popular routes from API data
  const popularRoutes = useMemo(() => {
    if (!data?.results || data.results.length === 0) return [];

    // Get unique routes from trips and sort by available seats (highest first)
    const routeMap = new Map<string, any>();
    data.results.forEach((trip: any) => {
      const routeKey = `${trip.route.origin.city}_${trip.route.destination.city}`;
      if (!routeMap.has(routeKey)) {
        routeMap.set(routeKey, trip);
      } else {
        // Update if current trip has more available seats
        const existing = routeMap.get(routeKey);
        if (trip.availableSeats > existing.availableSeats) {
          routeMap.set(routeKey, trip);
        }
      }
    });

    // Get top 4 routes sorted by available seats
    return Array.from(routeMap.values())
      .sort((a, b) => b.availableSeats - a.availableSeats)
      .slice(0, 4);
  }, [data]);

  if (isLoading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Popular Routes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6">
                <Skeleton className="h-16 w-full mb-4" />
                <Skeleton className="h-8 w-full mb-2" />
                <Skeleton className="h-6 w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Popular Routes</h2>

        {isError || popularRoutes.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-blue-50 rounded-lg p-8 max-w-md mx-auto">
              <div className="text-blue-500 text-5xl mb-4">🚌</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Routes Available Yet</h3>
              <p className="text-gray-600 text-sm">
                Popular routes will appear here once trips are added to the system. Check back soon!
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularRoutes.map((trip) => (
              <Link href={`/trip-detail/${trip.id || trip._id}`} key={trip.id || trip._id}>
                <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer h-full flex flex-col justify-between">
                  <div className="flex items-start justify-between mb-4 gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-semibold text-gray-700">{trip.route.origin.city}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-semibold text-gray-700">{trip.route.destination.city}</span>
                      </div>
                    </div>
                    <span className="text-gray-300 text-xl">→</span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-blue-600" />
                      <span className="text-blue-600 font-bold text-lg">
                        {(trip.pricePerSeat / 1000).toFixed(0)}K đ
                      </span>
                    </div>
                    <div className="bg-blue-50 rounded px-2 py-1">
                      <span className="text-xs font-semibold text-blue-700">{`${trip.availableSeats} seats`}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t text-xs text-gray-500">{trip.operator.companyName}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
