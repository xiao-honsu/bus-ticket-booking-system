'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useSearchTripsQuery } from '@/lib/store/services/api';
import { MapPin, DollarSign, Bus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 text-foreground">Popular Routes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-16 w-full mb-4" />
                  <Skeleton className="h-8 w-full mb-2" />
                  <Skeleton className="h-6 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 text-foreground">Popular Routes</h2>

        {isError || popularRoutes.length === 0 ? (
          <div className="text-center py-8">
            <Card className="max-w-md mx-auto gap-0 py-0">
              <CardContent className="p-6">
                <Bus className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-semibold text-card-foreground mb-2">No Routes Available Yet</h3>
                <p className="text-muted-foreground text-sm">
                  Popular routes will appear here once trips are added to the system. Check back soon!
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
            {popularRoutes.map((trip) => (
              <Link href={`/trip-detail/${trip.id || trip._id}`} key={trip.id || trip._id}>
                <Card className="gap-0 py-0 hover:shadow-lg transition-all duration-300 cursor-pointer h-full hover:-translate-y-1">
                  <CardContent className="p-6 flex flex-col justify-between h-full">
                    <div className="flex items-start justify-between mb-4 gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-semibold text-card-foreground">{trip.route.origin.city}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-semibold text-card-foreground">
                            {trip.route.destination.city}
                          </span>
                        </div>
                      </div>
                      <span className="text-muted-foreground text-xl">→</span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-primary" />
                        <span className="text-primary font-bold text-lg">
                          {(trip.pricePerSeat / 1000).toFixed(0)}K đ
                        </span>
                      </div>
                      <Badge variant="secondary">{`${trip.availableSeats} seats`}</Badge>
                    </div>

                    <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
                      {trip.operator.companyName}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
